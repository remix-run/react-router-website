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

> **NOTE:** Installation will fail if `REMIX_TOKEN` is not defined in your shell environment.

## Development

```sh
npm run dev
```

We'll need postgresql to run the database, I recommend using a local database, I use https://postgresapp.com for this, but I won't stop you from setting up fly's vpn if you really want to...

````
/wherever/your/code/is/reactrouter.com
/wherever/your/code/is/react-router

If you're actually writing docs, let's start up a watcher to automatically update the docs when the code changes.

```sh
ts-node scripts/watcher.ts
````

Now any changes you make to the docs to update

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
