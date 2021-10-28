# DB Stuff

- `:version`
  - v6 -> main branch
  - ref
    - in the DB
      - use it
    - not in the DB
      - go get it

# Seed DB

- Locally switch between file system and db
- Wipe it out (prisma cli for that)
- Seed it from GitHub

# This is the website for React Router.

```js
export default function RouteComp() {
  let [data, setData] = useState(null);
  let [isLoading, setIsLoading] = useState(false);
  let [error, setError] = useState(null);
  let navigate = useNavigate();
  let params = useParams();
  useEffect(() => {
    let controller = new AbortController();
    setIsLoading(true);
    fetch(api + "/whatever/" + params.id, {
      signal: controller.signal
    }).then(res => {
      if (res.status === 401) {
        navigate("/login");
      }
      return res.json();
    }).then(data => {
      if (!controller.signal.aborted) {
        setData(data);
        setIsLoading(false);
      }
    }
    return () => {
      controller.abort();
    }
  }, [params.id]);
  // ...
}
```

## Installation

```sh
npm ci
npx prisma generate

# NOTE: Check the env file and fill in any missing info!
cp .env.example .env
```

## Development

```sh
npm run dev
```

This will pull docs from the file system in dev, it expects the react router source directory to be sibling to this website's source directory. If you want to use the database file, you can start the dev server using `REMOTE_DOCS=true npm run dev`.

````
/wherever/your/code/is/reactrouter.com
/wherever/your/code/is/react-router

If you're actually writing docs, it's start up a live reload server from the Remix source repo:

```sh
cd ../remix/docs
livereload -e md
````

Now any changes you make to the docs will cause a reload.

## Deploying

```
build: "remix build"
watch: "remix watch"
dev: "remix dev"
```

```tsx
function Form() {
  let [state, setState] = useSessionStorageState();
  let location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/where/I/am") {
      return () => {
        // do weird stuff
      };
    }
  }, [location]);
  return; // ...
}

if (path.endsWith("*") && (!path !== "*" || !path.endsWith("/*"))) {
  throw new Error("now weigh!");
}

<Routes>
  <Route path="/foo/*">
    <Route path="more/stuff" />
  </Route>
</Routes>;
```
