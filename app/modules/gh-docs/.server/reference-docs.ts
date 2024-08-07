import LRUCache from "lru-cache";
import { ReflectionKind } from "typedoc";
import type { JSONOutput } from "typedoc";

import { processMarkdown } from "~/modules/gh-docs/.server/md";

import type { Doc, MenuDoc } from "./docs";
import { format } from "path";

declare global {
  var referenceDocCache: LRUCache<string, JSONOutput.ProjectReflection>;
}

let NO_CACHE = process.env.NO_CACHE;

global.referenceDocCache = new LRUCache<string, JSONOutput.ProjectReflection>({
  max: 10,
  ttl: NO_CACHE ? 1 : 300000, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: async (cacheKey) => {
    console.log(`Fetching fresh reference menu: ${cacheKey}`);
    return import.meta.env.DEV
      ? await loadDevelopmentData()
      : await loadProductionData();
  },
});

async function loadProductionData(): Promise<JSONOutput.ProjectReflection> {
  throw new Error("'loadProductionData' not implemented.");
}

async function loadDevelopmentData(): Promise<JSONOutput.ProjectReflection> {
  return (await import("../../../../data/api-docs.json" as unknown as string))
    .default as unknown as JSONOutput.ProjectReflection;
}

export async function getReferenceAPI(repo: string, ref: string, lang: string) {
  const api = await referenceDocCache.fetch(`${repo}:${ref}`);

  type Qualified = {
    node: JSONOutput.ReflectionSymbolId;
    id: number;
  };
  const mapper = (key: string): [string, Qualified][] => {
    let id = Number(key);
    let node = api.symbolIdMap[id];
    return [[node.qualifiedName, { node, id }]];
  };
  let symbolMapByQualifiedName = new Map<string, Qualified>(
    Object.keys(api.symbolIdMap).map(mapper).flat(1)
  );

  function getLink(
    _qualifiedName: string | number | JSONOutput.ReflectionSymbolId | undefined
  ) {
    let qualifiedName =
      (typeof _qualifiedName === "string"
        ? _qualifiedName
        : typeof _qualifiedName === "number"
        ? api.symbolIdMap[_qualifiedName].qualifiedName
        : _qualifiedName?.qualifiedName) ?? "";
    let symbol = symbolMapByQualifiedName.get(qualifiedName);
    if (!symbol) {
      console.log("No symbol found for", qualifiedName);
      return "#";
    }
    // find the package the qualifiedName belongs to
    let pkg = api.children?.find((child) =>
      child.children?.some((child) => child.name === qualifiedName)
    );
    if (!pkg) {
      let split = qualifiedName.split(".");
      let popped = [];
      while (!pkg && split.length > 1) {
        popped.push(split.pop());
        const splitName = split.join(".");
        pkg = api.children?.find((child) =>
          child.children?.some((child) => child.name === splitName)
        );
      }
      if (pkg) {
        qualifiedName = split.join(".");
        qualifiedName +=
          "#" +
          popped
            .reverse()
            .map((part = "") => {
              // turn it into a anchor tag id
              return part.toLowerCase().replace(/[^a-z0-9]/g, "");
            })
            .join(".");
      }
    }
    if (!pkg) {
      console.log("No package found for", qualifiedName);
      return "/";
    }
    return `/${lang}/${ref}/reference/${pkg.name}/${qualifiedName}`;
  }

  function getPackage(pkgName: string) {
    let pkg = api.children?.find((child) => child.name === pkgName);
    if (pkg == null) throw new Error("unexpected package name " + pkgName);
    return pkg;
  }

  async function getDoc(
    pkgName: string,
    qualifiedName: string
  ): Promise<Doc | null> {
    let pkg = getPackage(pkgName);
    let symbol = symbolMapByQualifiedName.get(qualifiedName);
    if (!symbol) return null;

    let node =
      pkg.children?.find((child) => child.name === qualifiedName) || null;
    if (!node) return null;
    // return {
    //   name: node.name,
    //   signatures: node.signatures
    //     ? await Promise.all(
    //         node.signatures.map(async (sig) => {
    //           let md = sig.comment
    //             ? sig.comment.summary.map((s) => s.text).join("")
    //             : null;
    //           return { html: md ? String(await processMarkdown(md)) : "" };
    //         })
    //       )
    //     : [],
    // };
    let markdown = declarationToMarkdown(node);
    return {
      attrs: {
        title: node.name,
      },
      filename: node.sources?.[0].fileName || "",
      slug: `${lang}/${ref}/reference/${pkgName}/${qualifiedName}`,
      html: (await processMarkdown(markdown.replace("<br>", "<br/>"))).html,
      headings: [],
      children: [],
    };
  }

  function commentToMarkdown(comment: JSONOutput.Comment) {
    let md = "";
    for (const part of comment.summary) {
      switch (part.kind) {
        case "code":
          md += part.text;
          break;
        case "text":
          md += part.text;
          break;
        case "inline-tag":
          md += inlineTagToMarkdown(part);
          break;
        default:
          console.log("Unknown comment part kind", part.kind);
      }
    }
    return md;
  }

  function declarationToMarkdown(
    declaration: JSONOutput.DeclarationReflection
  ) {
    let md = "";
    switch (declaration.kind) {
      case ReflectionKind.Function: {
        md = `# ${declaration.name}\n\n`;

        if (declaration.signatures) {
          for (let sig of declaration.signatures) {
            md += "```ts\n" + formatSignature(sig) + "\n```\n\n";

            if (sig.comment) {
              md += commentToMarkdown(sig.comment) + "\n\n";
            }
          }
        }

        if (declaration.comment) {
          md += commentToMarkdown(declaration.comment) + "\n\n";
        }

        break;
      }
      case ReflectionKind.Interface: {
        md = `# ${declaration.name} <small>interface</small>\n\n`;

        if (declaration.signatures) {
          for (let sig of declaration.signatures) {
            md += "```ts\n" + formatSignature(sig) + "\n```\n\n";

            if (sig.comment) {
              md += commentToMarkdown(sig.comment) + "\n\n";
            }
          }
        }

        if (declaration.comment) {
          md += commentToMarkdown(declaration.comment) + "\n\n";
        }

        for (let group of declaration.groups ?? []) {
          md += `## ${group.title}\n\n`;
          for (let id of group.children ?? []) {
            let child = declaration.children?.find((child) => child.id === id);
            if (!child) continue;
            md += `### ${child.name}\n\n`;
            if (child.type) {
              md += `Type: \`${formatType(child.type)}\`\n\n`;
            }
            if (child.comment) {
              md += commentToMarkdown(child.comment) + "\n\n";
            }
          }
        }
        break;
      }
      case ReflectionKind.TypeAlias: {
        md = `# ${declaration.name} <small>type</small>\n\n`;
        if (declaration.type) {
          md += "```ts\n";
          md += `type ${declaration.name} = ${formatType(declaration.type)}\n`;
          md += "```\n\n";
        }
        if (declaration.comment) {
          md += commentToMarkdown(declaration.comment) + "\n\n";
        }
        break;
      }
      default: {
        console.log("Unknown declaration kind", declaration.kind);
      }
    }
    return md;
  }

  function formatType(type: JSONOutput.SomeType): string {
    switch (type.type) {
      case "array":
        return `${formatType(type.elementType)}[]`;
      case "conditional":
        return `${formatType(type.checkType)} ? ${formatType(
          type.extendsType
        )} : ${formatType(type.falseType)}`;
      case "indexedAccess":
        return `${formatType(type.objectType)}[${formatType(type.indexType)}]`;
      case "inferred":
        return "any";
      case "intersection":
        return type.types.map(formatType).join(" & ");
      case "intrinsic":
        return type.name;
      case "literal":
        if (typeof type.value === "object") {
          return `${type.value?.negative ? "-" : ""}${type.value?.value ?? ""}`;
        }
        return JSON.stringify(type.value);
      case "mapped":
        return `{ [${type.parameter} in ${formatType(
          type.parameterType
        )}]: ${formatType(type.templateType)} }`;
      case "namedTupleMember":
        return `${type.name}: ${formatType(type.element)}`;
      case "optional":
        return `${formatType(type.elementType)}?`;
      case "predicate":
        return `${type.name} is ${
          type.targetType ? formatType(type.targetType) : "any"
        }`;
      case "query":
        return `typeof ${type.queryType}`;
      case "reference": {
        let result = type.name;
        if (type.typeArguments) {
          result += "<";
          let i = 0;
          for (let typeArgument of type.typeArguments) {
            if (i++ > 0) {
              result += ", ";
            }
            result += formatType(typeArgument);
          }
          result += ">";
        }
        return result;
      }
      case "reflection":
        return type.declaration.name;
      case "rest":
        return `...${formatType(type.elementType)}`;
      case "tuple":
        return `[${(type.elements ?? []).map(formatType).join(", ")}]`;
      case "union":
        return type.types.map(formatType).join(" | ");
      case "typeOperator":
        return `${type.operator} ${formatType(type.target)}`;
      default:
        return "unknown";
    }
  }

  function formatSignature(
    sig: JSONOutput.SignatureReflection | JSONOutput.TypeParameterReflection
  ) {
    switch (sig.kind) {
      case ReflectionKind.CallSignature: {
        sig = sig as JSONOutput.SignatureReflection;
        let typeParams = "";
        let typeParameters = sig.typeParameter ?? sig.typeParameters;
        if (typeParameters?.length) {
          typeParams += "<";
          let i = 0;
          for (let typeParameter of typeParameters) {
            if (i++ > 0) {
              typeParams += ", ";
            }
            typeParams += formatSignature(typeParameter);
          }
          typeParams += ">";
        }
        let args = "";
        if (sig.parameters?.length) {
          args = sig.parameters
            .map((param) => {
              return `${param.name}: ${
                param.type ? formatType(param.type) : "unknown"
              }`;
            })
            .join(", ");
        }
        return `function ${sig.name}${typeParams}(${args}): ${
          sig.type ? formatType(sig.type) : "unknown"
        }`;
      }
      case ReflectionKind.TypeParameter: {
        sig = sig as JSONOutput.TypeParameterReflection;
        let param = sig.name;
        if (sig.default) {
          param += ` = ${formatType(sig.default)}`;
        }
        return param;
      }
      default:
        console.log("Unknown signature kind", sig.kind);
        return "";
    }
  }

  function inlineTagToMarkdown(
    inlineTag: JSONOutput.InlineTagDisplayPart
  ): string {
    switch (inlineTag.tag) {
      case "@link":
        return `[${inlineTag.text}](${getLink(inlineTag.target)})`;
      default:
        console.log("unknown inline tag", inlineTag.tag);
        return "";
    }
  }

  function getPackagesNames() {
    return (
      api.children?.map((child) => {
        return {
          name: child.name,
          href: child.name.startsWith("@")
            ? child.name.split("/")[1]
            : child.name,
        };
      }) ?? []
    );
  }

  function getPackageNav(name: string) {
    let pkg = api.children?.find((child) => child.name === name);
    if (!pkg) return [];

    let _categories = pkg.categories ?? pkg.groups ?? [];
    let categories: MenuDoc[] = [];

    for (let category of _categories) {
      if (!category.children?.length) continue;

      // let c: MenuDoc = { title: category.title, children: [] };
      let c: MenuDoc = {
        attrs: {
          title: category.title,
        },
        filename: category.title,
        slugs: [],
        hasContent: false,
        children: [],
      };
      for (let id of category.children) {
        let child = api.symbolIdMap[id];
        if (!child) continue;

        c.slugs.push(`${pkg.name}/${child.qualifiedName}`);
        c.children.push({
          attrs: {
            title: child.qualifiedName,
          },
          filename: `${pkg.name}/${child.qualifiedName}`,
          slug: `/${lang}/${ref}/reference/${pkg.name}/${child.qualifiedName}`,
          hasContent: true,
          children: [],
        });
      }
      categories.push(c);
    }

    return categories;
  }

  function getReferenceNav() {
    let packages = getPackagesNames();
    let menu: MenuDoc[] = [];
    for (let pkg of packages) {
      let children = getPackageNav(pkg.name);
      if (!children.length) continue;
      menu.push({
        attrs: {
          title: pkg.name,
        },
        filename: pkg.href,
        slugs: children
          .map((child) => child.slugs ?? child.slug)
          .flat()
          .filter(Boolean) as string[],
        hasContent: false,
        children,
      });
    }

    return menu;
  }

  return {
    getDoc,
    getPackageNav,
    getReferenceNav,
  };
}
