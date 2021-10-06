React Router v6 takes all the best parts of React Router v3, v5, and @reach/router, in the smallest package yet.

:::

**Nested Routes**

Most apps have a series of nested layouts around the main sections of the page:

[UI on right, code on left, pop in sections and code together]

```tsx
<App>
  <Messages>
    <Thread />
  </Sales>
</App>
```

---

Without nested routes, you have to repeat these layouts across each page. For example, the root route renders the `App` component...

```tsx
function Root() {
  return <App />;
}
```

---

... and the `/messages` route also renders the `App` component.

```tsx [3,5]
function MessagesRoute() {
  return (
    <App>
      <Messages />
    </App>
  );
}
```

---

And the `/messages/:thread` route repeats the both!

```tsx [3,4,6,7]
function Thread() {
  return (
    <App>
      <Messages>
        <Thread />
      </Messages>
    </App>
  );
}
```

---

These layouts are almost always coupled to URL segments:

```tsx
<App> // "/"
  <Messages> // "/messages"
    <Thread /> // "/message/:id"
  </Sales>
</App>
```

---

In React Router, this concept is built in. You can define your routes, and url layout hierarchy, all at once:

```tsx
<Route path="/" element={<App />}>
  <Route path="messages" element={<Messages />}>
    <Route path=":id" element={<Thread />} />
  </Route>
</Route>
```

---

It also supports relative links, so you can link to deeper routes (or traverse up the route hiearchy) without having to know the full URL.

```tsx [6]
function Messages({ threads }) {
  return (
    <section>
      <nav>
        <Link to="..">Home</Link> / <Link to=".">Messages</Link>
        <hr />
        {threads.map((thread) => (
          <Link to={thread.id}>{thread.user.name}</Link>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}
```

---

Sometimes two routes' patterns match the same URL.

For example, these both match `"/messages/recent"`.

```tsx
<Routes>
  <Route path="messages/:id" element={<Thread />} />
  <Route path="messages/recent" element={<Recent />} />
</Routes>
```

---

React Router knows that the URL `/messages/recent` matches the route pattern `/messages/recent` more specifically than `/messages/:id`, so it does what you'd expect and renders `<Recent />`.

That's right. No more `exact` props or ordering your routes perfectly to get the right match.

```tsx [3]
<Routes>
  <Route path="messages/:id" element={<Thread />} />
  <Route path="messages/recent" element={<Recent />} />
</Routes>
```

:::
