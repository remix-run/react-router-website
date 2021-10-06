Howdy!

:::

## Nested Routes

Most apps have a series of nested layouts around the main sections of
the page. These layouts are nearly always coupled to URL segments.

```tsx

```

---

Every app has some root layout that is always rendering, that part is easy no matter what router you're using.

```tsx
<App />
```

---

But as segments are added to the URL, new layouts are added to the UI.

```tsx
<App>
  <Sales />
</App>
```

---

Sometimes it gets pretty deep, and you have to repeat these layout hierarchies across all routes in the app.

```tsx
<App>
  <Sales>
    <Invoices />
  </Sales>
</App>
```

---

It's not uncommon to have four levels of layouts!

```tsx
<App>
  <Sales>
    <Invoices>
      <Invoice />
    </Invoices>
  </Sales>
</App>
```

---

With React Router, this is all built-in. Nested routes add both segments to the URL and layouts to the UI hierarchy. As the URL changes, your layouts automatically change with it.

```tsx
<Route path="/" element={<App />}>
  <Route path="sales" element={<Sales />}>
    <Route path="invoices" element={<Invoices />}>
      <Route path=":invoice" element={<Invoice />} />
    </Route>
  </Route>
</Route>
```

:::

## Ranked Routes

Sometimes a URL like `teams/new` can match two route patterns:

```tsx
<Routes>
  <Route path="teams/:teamId" element={<Team />} />
  <Route path="teams/new" element={<NewTeam />} />
</Routes>
```

React Router ranks your routes and picks the best one. In this case it will pick `<NewTeam />` because it's more specific. No more messing with `exact` props or careful ordering!
