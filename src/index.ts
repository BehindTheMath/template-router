import page from "page";

const TemplateRouter: ITemplateRouter = function TemplateRouter(routeInfos: IRouteInfo | Array<IRouteInfo>) {
    if (!Array.isArray(routeInfos) && typeof routeInfos === "object") {
        page(routeInfos.route, getLoadPageFunction(routeInfos));
    } else if (Array.isArray(routeInfos)) {
        routeInfos.forEach(routeInfo => page(routeInfo.route, getLoadPageFunction(routeInfo)));
    }
};

function getLoadPageFunction(pageInfo: IPageInfo): PageJS.Callback {
    return async function (ctx: PageJS.Context, next: () => any): Promise<void> {
        let newCtx: PageJS.Context;

        const beforeFetchMiddlewareInfo: IBeforeFetchMiddlewareInfo = {
            querySelector: pageInfo.querySelector || "body",
            template: pageInfo.template,
            endpoint: pageInfo.endpoint,
        };
        ctx.middlewareInfo = beforeFetchMiddlewareInfo;
        newCtx = callMiddleware(pageInfo.beforeFetch);
        if (newCtx) {
            ctx = newCtx;
            if (newCtx.middlewareInfo.cancel) next();
        }

        const data = await fetch(ctx.middlewareInfo.endpoint).then(response => response.json());

        const beforeRenderMiddlewareInfo: IBeforeRenderMiddlewareInfo = {
            querySelector: ctx.middlewareInfo.querySelector,
            template: ctx.middlewareInfo.template,
            data
        };
        ctx.middlewareInfo = beforeRenderMiddlewareInfo;
        newCtx = callMiddleware(pageInfo.beforeRender);
        if (newCtx) {
            ctx = newCtx;
            if (newCtx.middlewareInfo.cancel) next();
        }

        const html: string = ctx.middlewareInfo.template(ctx.middlewareInfo.data);

        const afterRenderMiddlewareInfo: IAfterRenderMiddlewareInfo = {
            querySelector: ctx.middlewareInfo.querySelector,
            html
        };
        ctx.middlewareInfo = afterRenderMiddlewareInfo;
        newCtx = callMiddleware(pageInfo.afterRender);
        if (newCtx) {
            ctx = newCtx;
            if (newCtx.middlewareInfo.cancel) next();
        }

        document.querySelector(ctx.middlewareInfo.querySelector).innerHTML = html;

        ctx.save();
        next();

        function callMiddleware(middleware: Middleware): PageJS.Context {
            let newCtx: PageJS.Context = ctx;

            if (middleware) {
                if (Array.isArray(middleware)) {
                    middleware.forEach(singleMiddleware => {
                        const tempCtx: PageJS.Context = singleMiddleware(newCtx);
                        if (tempCtx) newCtx = tempCtx;
                    });
                } else if (typeof middleware === "function") {
                    const tempCtx: PageJS.Context = middleware(newCtx);
                    if (tempCtx) newCtx = tempCtx;
                }
            }

            return newCtx;
        }
    };
}

interface ITemplateRouter {
    (routeInfos: IRouteInfo | Array<IRouteInfo>);
    page?: PageJS.Static;
}

type CtxFunction = (ctx: PageJS.Context) => PageJS.Context;
type Middleware = CtxFunction | Array<CtxFunction>;

interface IBaseMiddlewareInfo {
    querySelector: string;
    cancel?: boolean;
}

interface ITemplateMixin {
    template: (data: object) => string;
}

type IBeforeFetchMiddlewareInfo = IBaseMiddlewareInfo & ITemplateMixin & {
    endpoint: string;
}

type IBeforeRenderMiddlewareInfo = IBaseMiddlewareInfo & ITemplateMixin & {
    data: object;
}

type IAfterRenderMiddlewareInfo = IBaseMiddlewareInfo & {
    html: string;
}

interface IPageInfo {
    querySelector?: string;
    template?: (data: object) => string;
    endpoint?: string;
    beforeFetch?: Middleware;
    beforeRender?: Middleware;
    afterRender?: Middleware;
}

interface IRouteInfo extends IPageInfo {
    route: string;
}

TemplateRouter.page = page;

export default TemplateRouter;