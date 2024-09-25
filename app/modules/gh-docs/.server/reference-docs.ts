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

// TODO: can make this lower when we make the api fetching dynamic
let oneDay = 1000 * 60 * 60 * 24;

global.referenceDocCache = new LRUCache<string, JSONOutput.ProjectReflection>({
  max: 10,
  ttl: NO_CACHE ? 1 : oneDay,
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
  // TODO: in the future we'll pull from the repo with raw github and create new
  // versions of that file with each release, for now you have to generate the api-docs.json
  // locally from the react-router repo and then copy it over here:
  //
  // ```
  // # from react-router
  // $ npm run typedoc
  // # from reactrouter-website
  // $ npm run api:cp
  // ```
  return loadDevelopmentData();
}

async function loadDevelopmentData(): Promise<JSONOutput.ProjectReflection> {
  return (await import("../../../../data/api-docs.json" as unknown as string))
    .default as unknown as JSONOutput.ProjectReflection;
}

export async function getReferenceAPI(repo: string, ref: string) {
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

  function getSymbol(qualifiedName: string) {
    let symbol = symbolMapByQualifiedName.get(qualifiedName);
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("UNSTABLE_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("INTERNAL_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("UNSAFE_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("unstable_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("internal_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get("unsafe_" + qualifiedName);
    }
    if (!symbol) {
      symbol = symbolMapByQualifiedName.get(
        qualifiedName.replace(/^(unstable|unsafe|internal)_/, "")
      );
    }
    return symbol;
  }

  function getLink(
    _qualifiedName: string | number | JSONOutput.ReflectionSymbolId | undefined
  ) {
    let qualifiedName =
      (typeof _qualifiedName === "string"
        ? _qualifiedName
        : typeof _qualifiedName === "number"
        ? api.symbolIdMap[_qualifiedName].qualifiedName
        : _qualifiedName?.qualifiedName) ?? "";
    let symbol = getSymbol(qualifiedName);
    if (!symbol) {
      console.error("No symbol found for", qualifiedName);
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
      console.error("No package found for", qualifiedName);
      return "#";
    }

    // TODO: this URL depends on implementation details of the app so it doesn't
    // meet the requirements to be in the `modules` folder.
    //
    // - routes already have :pkg so we use a relative URL
    // - the app doesn't use trailing slashes so we can do ./ instead of ../
    return `./${qualifiedName}`;
  }

  function getPackage(pkgName: string) {
    let pkg = api.children?.find((child) => child.name === pkgName);
    if (pkg == null) throw new Error("unexpected package name " + pkgName);
    return pkg;
  }

  async function getDoc(
    pkgName: string,
    qualifiedName: string,
    shouldProcessMarkdown = true
  ): Promise<Doc | null> {
    let pkg = getPackage(pkgName);
    let symbol = getSymbol(qualifiedName);
    if (!symbol) return null;

    let node =
      pkg.children?.find((child) => child.name === qualifiedName) ||
      pkg.children?.find(
        (child) =>
          child.name === "UNSAFE_" + qualifiedName ||
          child.name === "unsafe_" + qualifiedName
      ) ||
      pkg.children?.find(
        (child) =>
          child.name === "UNSTABLE_" + qualifiedName ||
          child.name === "unstable_" + qualifiedName
      ) ||
      pkg.children?.find(
        (child) =>
          child.name === "INTERNAL_" + qualifiedName ||
          child.name === "internal_" + qualifiedName
      ) ||
      null;

    if (!node) return null;

    let markdown = shouldProcessMarkdown ? declarationToMarkdown(node) : "";
    return {
      attrs: {
        title: node.name,
      },
      filename: node.sources?.[0].fileName || "",
      slug: qualifiedName,
      html: (await processMarkdown(markdown.replace("<br>", "<br/>"))).html,
      headings: [],
      children: [],
    };
  }

  async function getPackageIndexDoc(pkgName: string): Promise<Doc> {
    let pkg = getPackage(pkgName);

    let md = "";
    if (pkg.readme) {
      md += commentToMarkdown({
        summary: pkg.readme,
      });
    }

    return {
      attrs: {
        title: pkg.name,
      },
      filename: pkg.name,
      slug: pkg.name,
      html: (await processMarkdown(md.replace("<br>", "<br/>"))).html,
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

  function getLinkFromType(type: JSONOutput.SomeType | undefined | null) {
    switch (type?.type) {
      case "intrinsic":
        return `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${type.name}`;
      case "reference":
        if (type.package === "typescript") {
          return `#`;
        }
        return getLink(type.name);
      default:
        if (type) {
          if ("elementType" in type) {
            return getLinkFromType(type.elementType);
          }
        }
        return "#";
    }
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

            if (sig.parameters?.length) {
              md += "## Parameters\n\n";
              for (let param of sig.parameters) {
                let name =
                  param.name === "__namedParameters" ? "props" : param.name;
                md += "- **" + name + "**: ";
                if (param.type) {
                  // console.log(param.type);
                  const link = getLinkFromType(param.type);
                  if (link === "#") {
                    if (
                      param.type?.type === "reflection" &&
                      param.type.declaration
                    ) {
                      md += "`" + formatType(param.type) + "`" + "\n";
                    } else {
                      md += formatType(param.type) + "\n";
                    }
                  } else {
                    md += `[${formatType(param.type)}](${link})\n`;
                  }
                } else {
                  md += "unknown\n";
                }
              }
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

            if (sig.parameters?.length) {
              md += "## Parameters\n\n";
              for (let param of sig.parameters) {
                let name =
                  param.name === "__namedParameters" ? "props" : param.name;
                md += "- **" + name + "**: ";
                if (param.type) {
                  // TODO: Update to be getLinksFromType
                  const link = getLinkFromType(param.type);
                  if (link === "#") {
                    if (
                      param.type?.type === "reflection" &&
                      param.type.declaration
                    ) {
                      md += "`" + formatType(param.type) + "`" + "\n";
                    } else {
                      md += formatType(param.type) + "\n";
                    }
                  } else {
                    md += `[${formatType(param.type)}](${link})\n`;
                  }
                } else {
                  md += "unknown\n";
                }
              }
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
            if (child.signatures?.length === 1) {
              md += "Type: `" + formatSignature(child.signatures[0]) + "`\n\n";
            } else if (child.type) {
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
      case ReflectionKind.Variable: {
        md = `# ${declaration.name} <small>variable</small>\n\n`;
        if (declaration.defaultValue) {
          md += "```ts\n";
          md += `const ${declaration.name} = ${declaration.defaultValue}\n`;
          md += "```\n\n";
        }
        if (declaration.comment) {
          md += commentToMarkdown(declaration.comment) + "\n\n";
        }
        break;
      }
      case ReflectionKind.Class: {
        // TODO: Implement this
        break;
      }
      default: {
        console.error("Unknown declaration kind", declaration.kind);
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
        if (typeof type.value === "object" && type.value) {
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
        return formatTypeDeclaration(type.declaration);
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

  function formatTypeDeclaration(
    declaration:
      | JSONOutput.ReferenceReflection
      | JSONOutput.DeclarationReflection
  ) {
    let formatted = "{ ";
    if (declaration.children) {
      for (let child of declaration.children) {
        if (child.type) {
          formatted += `\n  ${child.name}: ${formatType(child.type)},`;
        } else {
          console.error("No type for", child.name);
        }
      }
    }
    return formatted.length > 2 ? formatted + "\n}" : formatted + " }";
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
              return `${
                param.name === "__namedParameters" ? "props" : param.name
              }`;
            })
            .join(", ");
        }
        return `${sig.name}${typeParams}(${args}): ${
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

  async function getPackageNav(name: string) {
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
        let doc = await getDoc(pkg.name, child.qualifiedName);
        let lowerTitle = doc?.attrs.title.toLowerCase() ?? "";
        if (
          !doc ||
          lowerTitle.startsWith("unsafe_") ||
          lowerTitle.startsWith("internal_")
        )
          continue;

        c.slugs.push(child.qualifiedName);

        c.children.push({
          attrs: {
            title: child.qualifiedName,
          },
          filename: `${pkg.name}/${child.qualifiedName}`,
          slug: child.qualifiedName,
          hasContent: true,
          children: [],
        });
      }
      categories.push(c);
    }

    return categories;
  }

  async function getReferenceNav() {
    let packages = getPackagesNames();
    let menu: MenuDoc[] = [];
    for (let pkg of packages) {
      let children = await getPackageNav(pkg.name);
      if (!children.length) continue;
      menu.push({
        attrs: {
          title: pkg.name,
          href: pkg.href,
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
    getPackageIndexDoc,
    getPackageNav,
    getReferenceNav,
  };
}
