TemplateRouter is a tool for [page.js](https://github.com/visionmedia/page.js) to quickly bind precompiled templates and API endpoints to routes. It automates the work of fetching the API data and rendering the templates when each route is called.

# Use case
TemplateRouter is meant to be in-between a plain JS router like page.js, and a full-fledged framework like Vue or React. For really small webapps, even Vue can be unnecessary.

TemplateRouter is meant for binding one template to one API endpoint, and those to one route. There are no components or data binding or dynamic rendering. When the route is called, the data is fetched from the API, the template is rendered and inserted into the DOM.

# Setup
Add script tags for Handlebars or the templating engine of your choice, as well as for TemplateRouter. (page.js is bundled with TemplateRouter).

To access page.js directly, use `TemplateRouter.page()`
# Sample usage
```javascript
TemplateRouter.page("/", setupIndex);

TemplateRouter.route([
    {
        route: "/products",
        template: productsTemplate,
        endpoint: "/api/v1/products",
        querySelector: "div#page"
    },
    {
        route: "/products/:id",
        template: productTemplate,
        querySelector: "div#page",
        beforeFetch: function(ctx) {
            ctx.middlewareInfo.endpoint = `/api/v1/products/${ctx.params.id}`;
            return ctx;
        }
    }
]);

TemplateRouter.page();
```

See the [example folder](/example) for a more extensive example. To actually use the example, copy `template-router.js` to the `example` folder, and then serve them with a local HTTP server like [`http-server`](https://www.npmjs.com/package/http-server).

# API
Template Router is a static class with the following methods. All methods return the class, so you can chain methods.

### `static route(routeInfos: IRouteInfo | Array<IRouteInfo>): TemplateRouter`
This method sets up the routes. You can pass a single `IRouteInfo` object, or an array.

#### `interface IRouteInfo`
##### `route: string`
This is the path that will be passed to page.js for the route (see [here](https://github.com/visionmedia/page.js/tree/1034c8cbed600ea7da378a73716c885227c03270#matching-paths)).

##### `template: (data: object) => string`
This is a precompiled template to render.

##### `endpoint: string`
This is the API endpoint to fetch the data from. This will be passed to `fetch()`, so any URI valid for `fetch()` will work.

##### `querySelector?: string`
This is the query selector used to select where the rendered HTML will be output to the page. The default is inside the `<body>` tag.

##### `beforeFetch?: Middleware`
```
type Middleware = (ctx: PageJS.Context) => PageJS.Context | Array<(ctx: PageJS.Context) => PageJS.Context>
```

This property can take a single middleware function, or an array of functions. Each function will be called before `fetch()` requests data from the API endpoint.

Each middleware, when called, will be passed page.js's Context object, with an additional `pageInfo` property. This property contains the `template`, `endpoint`, and `querySelector` properties from `IRouteInfo`. To change any of the properties, modify `ctx` and return it. It will then be passed in turn to all of the subsequent middleware functions.

To cancel all further processing of this route by TemplateRouter, set `ctx.middlewareInfo.cancel = true`, and then return `ctx`.

##### `beforeRender?: Middleware`
This is the same as `beforeFetch`, except that it is called after the data is fetched from the API, but before the template is rendered.

The `ctx.middlewareInfo` property will have the `template` and `querySelector` properties, as well as a `data` property, which contains the JSON data received from the API.

##### `afterRender?: Middleware`
This is the same as `beforeFetch`, except that it is called after the HTML is rendered from the template, but before it is inserted into the DOM.

The `ctx.middlewareInfo` property will have the `querySelector` property, as well as an `html` property, which contains the rendered HTML.

### `static use(method: Function): TemplateRouter`
By default, TemplateRouter will use [Handlebars](http://handlebarsjs.com/) for uncompiled templates. You can override that by passing a different templating engine's compile method to the `.use()` method. TemplateRouter will then call that method to compile the template before rendering.

### `static page: page`
This is to access page.js directly.