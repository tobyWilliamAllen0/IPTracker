import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useLoaderData } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect, useReducer, useRef, useMemo } from "react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  },
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const MobileBG = "/assets/pattern-bg-mobile-BXCQn_w1.png";
const Arrow = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='11'%20height='14'%3e%3cpath%20fill='none'%20stroke='%23FFF'%20stroke-width='3'%20d='M2%201l6%206-6%206'/%3e%3c/svg%3e";
const Map = void 0;
let hydrating = true;
function ClientOnly({ children, fallback = null }) {
  const [hydrated, setHydrated] = useState(() => !hydrating);
  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);
  return hydrated ? /* @__PURE__ */ jsx(Fragment, { children: children() }) : /* @__PURE__ */ jsx(Fragment, { children: fallback });
}
function formatUrl(path) {
  const adjustedPath = path[0] !== "/" ? `/${path}` : path;
  return "https://geo.ipify.org/api/v2" + adjustedPath;
}
async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return parseJSON(response);
  }
  return Promise.reject(await response.text());
}
async function parseJSON(response) {
  if (response && response.headers) {
    if (response.headers.get("Content-Type") === "application/json") {
      return await response.json();
    }
    if (response.headers.get("Content-Type") === "text/plain;charset=UTF-8") {
      return await response.text();
    }
  }
  return response;
}
async function ApiClient(path, options) {
  const url = formatUrl(path);
  const fetchOptions = options;
  fetchOptions.headers = fetchOptions.headers || {};
  if (fetchOptions.type === "formdata") {
    fetchOptions.body = new FormData();
    for (const key in options.data) {
      if (typeof key === "string" && options.data.hasOwnProperty(key) && typeof options.data[key] !== "undefined") {
        fetchOptions.body.append(key, options.data[key]);
      }
    }
  } else {
    fetchOptions.body = JSON.stringify(options.data);
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.headers["Accept"] = "application/json";
  }
  return fetch(url, { ...fetchOptions }).then(checkStatus).then(parseJSON);
}
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, isLoading: true, error: null, response: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
        response: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        response: null
      };
    default:
      return state;
  }
};
function useFetch(action) {
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    error: null,
    response: null
  });
  async function performAction(options) {
    try {
      dispatch({ type: "FETCH_INIT" });
      const res = await ApiClient(options.url, options);
      action && action.onSuccess && action.onSuccess(res);
      dispatch({ type: "FETCH_SUCCESS", payload: res });
    } catch (e) {
      dispatch({ type: "FETCH_FAILURE", payload: e });
    }
  }
  return [state, performAction];
}
const meta = () => {
  return [
    { title: "IP TRacker" },
    { name: "description", content: "IP Tracker APP" }
  ];
};
const loader = async () => {
  const response = await fetch(
    process.env.BASE_URL + `country,city?apiKey=${process.env.API_KEY}`
  );
  const data = await response.json();
  return {
    data,
    apiKey: process.env.API_KEY
    // Pass the API key to the component
  };
};
function Index() {
  var _a;
  const { data, apiKey } = useLoaderData();
  const inputRef = useRef(null);
  const [lookUpIPData, lookUpIP] = useFetch();
  const handleIpLookup = () => {
    var _a2, _b;
    if ((_a2 = inputRef.current) == null ? void 0 : _a2.value) {
      lookUpIP({
        url: `country,city?apiKey=${apiKey}&ipAddress=${(_b = inputRef.current) == null ? void 0 : _b.value}`,
        method: "GET"
      });
    }
  };
  const usableData = useMemo(() => {
    if (lookUpIPData.response) {
      return lookUpIPData.response;
    } else {
      return data;
    }
  }, [data, lookUpIPData.response]);
  const makeAddress = useMemo(() => {
    var _a2, _b, _c, _d;
    return `${(_a2 = usableData == null ? void 0 : usableData.location) == null ? void 0 : _a2.city}, ${(_b = usableData == null ? void 0 : usableData.location) == null ? void 0 : _b.region}, ${(_c = usableData == null ? void 0 : usableData.location) == null ? void 0 : _c.postalCode}, ${(_d = usableData == null ? void 0 : usableData.location) == null ? void 0 : _d.country}`;
  }, [usableData]);
  const items = useMemo(() => {
    var _a2;
    return [
      {
        label: "IP ADDRESS",
        value: usableData == null ? void 0 : usableData.ip
      },
      {
        label: "LOCATION",
        value: makeAddress
      },
      {
        label: "TIMEZONE",
        value: (_a2 = usableData == null ? void 0 : usableData.location) == null ? void 0 : _a2.timezone
      },
      {
        label: "ISP",
        value: usableData == null ? void 0 : usableData.isp
      }
    ];
  }, [
    makeAddress,
    usableData == null ? void 0 : usableData.ip,
    usableData == null ? void 0 : usableData.isp,
    (_a = usableData == null ? void 0 : usableData.location) == null ? void 0 : _a.timezone
  ]);
  return /* @__PURE__ */ jsxs("div", { className: "h-screen", children: [
    /* @__PURE__ */ jsxs(
      "header",
      {
        className: `flex flex-col items-center w-full h-1/3 md:h-full md:max-h-[225px] bg-no-repeat bg-center bg-cover p-4 `,
        style: {
          backgroundImage: `url(${MobileBG})`
        },
        children: [
          /* @__PURE__ */ jsx("h2", { className: "text-white text-2xl", children: "IP Address Tracker" }),
          /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg m-auto h-12 mt-6 ", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: inputRef,
                className: "h-12 w-full rounded-lg px-4 pr-14 bg-white outline-none text-gray-800",
                type: "text",
                placeholder: "Search for any IP address or domain"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-12 h-12 bg-black absolute right-0 top-0 flex items-center justify-center rounded-r-lg",
                onClick: handleIpLookup,
                children: /* @__PURE__ */ jsx("img", { src: Arrow, alt: "arrow" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `relative flex flex-col md:flex-row md:max-w-4xl md:w-full md:justify-around md:py-10 md:[&>*]:border-r-[1px] gap-4 bg-white p-4 items-center justify-center mx-4 mt-4 rounded-xl w-full z-20 ${(lookUpIPData == null ? void 0 : lookUpIPData.isLoading) ? "blur-sm" : ""}`,
              children: items.map((item, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `flex flex-col gap-1 items-center justify-center md:w-1/4 ${index === items.length - 1 ? "!border-r-0" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 font-semibold text-center", children: item.label }),
                    /* @__PURE__ */ jsx("span", { className: "text-xl text-black text-center font-semibold", children: item.value })
                  ]
                },
                item.label
              ))
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("main", { className: "w-full h-2/3 md:h-full z-0 relative", children: /* @__PURE__ */ jsx(
      ClientOnly,
      {
        fallback: /* @__PURE__ */ jsx(
          "div",
          {
            id: "skeleton",
            style: { height: "100%", background: "#d1d1d1" }
          }
        ),
        children: () => {
          var _a2, _b;
          return /* @__PURE__ */ jsx(
            Map,
            {
              height: "100%",
              initialPosition: [
                (_a2 = usableData == null ? void 0 : usableData.location) == null ? void 0 : _a2.lat,
                (_b = usableData == null ? void 0 : usableData.location) == null ? void 0 : _b.lng
              ]
            }
          );
        }
      }
    ) })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CZE734QN.js", "imports": ["/assets/components-DM-54YYR.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-ClitvxnG.js", "imports": ["/assets/components-DM-54YYR.js"], "css": ["/assets/root-DwrA4iZT.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-CYzNcCIh.js", "imports": ["/assets/components-DM-54YYR.js"], "css": [] } }, "url": "/assets/manifest-d0725438.js", "version": "d0725438" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
