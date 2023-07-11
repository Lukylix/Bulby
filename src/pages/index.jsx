/* eslint-disable react/no-array-index-key */
import useSWR, { SWRConfig } from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useEffect, useContext, useState, useMemo, useRef } from "react";
import { BiError } from "react-icons/bi";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widgets/widget";
import Revalidate from "components/toggles/revalidate";
import createLogger from "utils/logger";
import useWindowFocus from "utils/hooks/window-focus";
import { getSettings } from "utils/config/config";
import { ColorContext } from "utils/contexts/color";
import { ThemeContext } from "utils/contexts/theme";
import { SettingsContext } from "utils/contexts/settings";
import { backpacksResponse, bookmarksResponse, servicesResponse, widgetsResponse } from "utils/config/api-response";
import ErrorBoundary from "components/errorboundry";
import themes from "utils/styles/themes";
import QuickLaunch from "components/quicklaunch";
import { getStoredProvider, searchProviders } from "components/widgets/search/search";
import Backpack from "components/backpacks/item";

const ThemeToggle = dynamic(() => import("components/toggles/theme"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/toggles/color"), {
  ssr: false,
});

const Version = dynamic(() => import("components/version"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather", "openmeteo", "search", "datetime"];

export async function getStaticProps() {
  let logger;
  try {
    logger = createLogger("index");
    const { providers, ...settings } = getSettings();

    const services = await servicesResponse();
    const bookmarks = await bookmarksResponse();
    const widgets = await widgetsResponse();
    const backpacks = await backpacksResponse();

    return {
      props: {
        initialSettings: settings,
        fallback: {
          "/api/services": services,
          "/api/bookmarks": bookmarks,
          "/api/widgets": widgets,
          "/api/hash": false,
          "/api/backpacks": backpacks,
        },
        ...(await serverSideTranslations(settings.language ?? "en")),
      },
    };
  } catch (e) {
    if (logger) {
      logger.error(e);
    }
    return {
      props: {
        initialSettings: {},
        fallback: {
          "/api/services": [],
          "/api/bookmarks": [],
          "/api/widgets": [],
          "/api/hash": false,
          "/api/backpacks": [],
        },
        ...(await serverSideTranslations("en")),
      },
    };
  }
}

function Index({ initialSettings, fallback }) {
  const windowFocused = useWindowFocus();
  const [stale, setStale] = useState(false);
  const { data: errorsData } = useSWR("/api/validate");
  const { data: hashData, mutate: mutateHash } = useSWR("/api/hash");

  useEffect(() => {
    if (windowFocused) {
      mutateHash();
    }
  }, [windowFocused, mutateHash]);

  useEffect(() => {
    if (hashData) {
      if (typeof window !== "undefined") {
        const previousHash = localStorage.getItem("hash");

        if (!previousHash) {
          localStorage.setItem("hash", hashData.hash);
        }

        if (previousHash && previousHash !== hashData.hash) {
          setStale(true);
          localStorage.setItem("hash", hashData.hash);

          fetch("/api/revalidate").then((res) => {
            if (res.ok) {
              window.location.reload();
            }
          });
        }
      }
    }
  }, [hashData]);

  if (stale) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-24 h-24 border-2 border-theme-400 border-solid rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (errorsData && errorsData.length > 0) {
    return (
      <div className="w-full h-screen container m-auto justify-center p-10 pointer-events-none">
        <div className="flex flex-col">
          {errorsData.map((error, i) => (
            <div
              className="basis-1/2 bg-theme-500 dark:bg-theme-600 text-theme-600 dark:text-theme-300 m-2 rounded-md font-mono shadow-md border-4 border-transparent"
              key={i}
            >
              <div className="bg-amber-200 text-amber-800 dark:text-amber-200 dark:bg-amber-800 p-2 rounded-md font-bold">
                <BiError className="float-right w-6 h-6" />
                {error.config}
              </div>
              <div className="p-2 text-theme-100 dark:text-theme-200">
                <pre className="opacity-50 font-bold pb-2">{error.reason}</pre>
                <pre className="text-sm">{error.mark.snippet}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SWRConfig value={{ fallback, fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()) }}>
      <ErrorBoundary>
        <Home initialSettings={initialSettings} />
      </ErrorBoundary>
    </SWRConfig>
  );
}

const headerStyles = {
  boxed:
    "m-4 mb-0 sm:m-8 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
  underlined: "m-4 mb-0 sm:m-8 sm:mb-1 border-b-2 pb-4 border-theme-800 dark:border-theme-200/50",
  clean: "m-4 mb-0 sm:m-8 sm:mb-0",
  boxedWidgets: "m-4 mb-0 sm:m-8 sm:mb-0 sm:mt-1",
};

const columnsMap = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-1 @[34rem]:grid-cols-2",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3 @[68rem]:grid-cols-4",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3 @[68rem]:grid-cols-4 @[85rem]:grid-cols-5",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3 @[68rem]:grid-cols-4 @[85rem]:grid-cols-5 @[102rem]:grid-cols-6",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3 @[68rem]:grid-cols-4 @[85rem]:grid-cols-5 @[102rem]:grid-cols-6 [119rem]:grid-cols-7",
  "grid-cols-1 @[34rem]:grid-cols-2 @[51rem]:grid-cols-3 @[68rem]:grid-cols-4 @[85rem]:grid-cols-5 @[102rem]:grid-cols-6 [119rem]:grid-cols-7 [136rem]:grid-cols-8",
];

const columnsRemSizeMap = [1, 1, 17, 17, 17, 17, 17, 17, 17, 17];

function Home({ initialSettings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);
  const { settings, setSettings } = useContext(SettingsContext);

  const [childrensToSlice, setChildrensToSlice] = useState(0);

  const containerRef = useRef();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings, setSettings]);

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");
  const { data: backpacks } = useSWR("/api/backpacks");

  useEffect(() => {
    console.log(backpacks);
  }, [backpacks]);

  const widthServices = useMemo(() => {
    const widthRatio = settings?.main?.widthRatio?.split("/") || [1, 1];
    return widthRatio[0] / widthRatio[1];
  }, [settings?.main?.widthRatio]);

  const numberOfServicesWithoutRaws = useMemo(
    () =>
      services
        .filter((e) => e)
        .filter((g) => {
          const style = initialSettings.layout?.[g.name]?.style;
          if (style === "row" || style === "auto-row" || style === "auto-row-center") return false;
          return true;
        }).length,
    [services, initialSettings.layout]
  );

  const servicesTopRows = useMemo(() => {
    const indexesToSlice = [];
    let foundIndexes = 0;
    for (let i = services.filter((e) => e).length - 1; i > 0; i -= 1) {
      if (foundIndexes === childrensToSlice) break;
      const style = initialSettings.layout?.[services.filter((e) => e)?.[i].name]?.style;
      if (style !== "row" && style !== "auto-row" && style !== "auto-row-center") foundIndexes += 1;
      indexesToSlice.push(i);
    }

    const indexToSliceStart = indexesToSlice.sort().shift() || services.filter((e) => e).length;

    return indexesToSlice.length > 0 ? services.filter((v, i) => i < indexToSliceStart) : services.filter((e) => e);
  }, [services, childrensToSlice, initialSettings.layout]);

  const servicesBottomRows = useMemo(() => {
    if (childrensToSlice === 0) return [];
    const indexesToSlice = [];
    let foundIndexes = 0;
    for (let i = services.filter((e) => e).length - 1; i > 0; i -= 1) {
      if (foundIndexes === childrensToSlice) break;
      const style = initialSettings.layout?.[services.filter((e) => e)?.[i].name]?.style;
      if (style !== "row" && style !== "auto-row" && style !== "auto-row-center") foundIndexes += 1;
      indexesToSlice.push(i);
    }

    const indexToSliceStart = indexesToSlice.sort().shift() || services.filter((e) => e).length;

    return indexesToSlice.length > 0 ? services.filter((v, i) => i >= indexToSliceStart) : services.filter((e) => e);
  }, [services, childrensToSlice, initialSettings.layout]);

  const servicesAndBookmarks = [
    ...services
      .map((sg) => sg.services)
      .flat(1)
      .map((service) => (service.type === "grouped-service" ? service.services : service))
      .flat(1),
    ...bookmarks.map((bg) => bg.bookmarks).flat(),
  ];

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }

    if (settings.theme && theme !== settings.theme) {
      setTheme(settings.theme);
    }

    if (settings.color && color !== settings.color) {
      setColor(settings.color);
    }
  }, [i18n, settings, color, setColor, theme, setTheme]);

  const [searching, setSearching] = useState(false);
  const [searchString, setSearchString] = useState("");
  let searchProvider = null;
  const searchWidget = Object.values(widgets).find((w) => w.type === "search");
  if (searchWidget) {
    if (Array.isArray(searchWidget.options?.provider)) {
      // if search provider is a list, try to retrieve from localstorage, fall back to the first
      searchProvider = getStoredProvider() ?? searchProviders[searchWidget.options.provider[0]];
    } else if (searchWidget.options?.provider === "custom") {
      searchProvider = {
        url: searchWidget.options.url,
      };
    } else {
      searchProvider = searchProviders[searchWidget.options?.provider];
    }
  }
  const headerStyle = initialSettings?.headerStyle || "underlined";

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "BODY") {
        if (String.fromCharCode(e.keyCode).match(/(\w|\s)/g) && !(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
          setSearching(true);
        } else if (e.key === "Escape") {
          setSearchString("");
          setSearching(false);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const { width } = entry.contentRect;
        const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

        const itemRemSize =
          columnsRemSizeMap[parseInt(settings?.main?.columns || services.filter((v) => v).length || 1, 10)];

        const remWidth = width / remSize;
        const maxChildrenFit = Math.floor(remWidth / itemRemSize);
        if (
          !itemRemSize ||
          !maxChildrenFit ||
          numberOfServicesWithoutRaws < maxChildrenFit ||
          !(remWidth / itemRemSize > 1)
        )
          return setChildrensToSlice(0);

        const toSlice = numberOfServicesWithoutRaws % Math.min(settings?.main?.columns, maxChildrenFit || 1);
        setChildrensToSlice(toSlice);
      }
      return true;
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, numberOfServicesWithoutRaws, settings?.main?.columns, services]);

  return (
    <>
      <Head>
        <title>{initialSettings.title || "Homepage"}</title>
        {initialSettings.base && <base href={initialSettings.base} />}
        {initialSettings.favicon ? (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href={initialSettings.favicon} />
            <link rel="icon" href={initialSettings.favicon} />
          </>
        ) : (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
            <link rel="shortcut icon" href="/homepage.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
          </>
        )}
        <meta
          name="msapplication-TileColor"
          content={themes[initialSettings.color || "slate"][initialSettings.theme || "dark"]}
        />
        <meta name="theme-color" content={themes[initialSettings.color || "slate"][initialSettings.theme || "dark"]} />
      </Head>
      {initialSettings?.background?.video && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center	">
          <video className="object-cover w-full h-full" playsInline autoPlay muted loop>
            <source src={initialSettings?.background?.video} />
          </video>
        </div>
      )}
      <div className="relative container m-auto flex flex-col justify-start z-10 h-full">
        <div className={classNames("flex flex-row flex-wrap  justify-between", headerStyles[headerStyle])}>
          <QuickLaunch
            servicesAndBookmarks={servicesAndBookmarks}
            searchString={searchString}
            setSearchString={setSearchString}
            isOpen={searching}
            close={setSearching}
            searchProvider={settings.quicklaunch?.hideInternetSearch ? null : searchProvider}
          />
          {widgets && (
            <>
              {widgets
                .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                .map((widget, i) => (
                  <Widget key={i} widget={widget} style={{ header: headerStyle, isRightAligned: false }} />
                ))}

              <div
                className={classNames(
                  "m-auto flex flex-wrap grow sm:basis-auto justify-between md:justify-end",
                  headerStyle === "boxedWidgets" ? "sm:ml-4" : "sm:ml-2"
                )}
              >
                {widgets
                  .filter((widget) => rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget key={i} widget={widget} style={{ header: headerStyle, isRightAligned: true }} />
                  ))}
              </div>
            </>
          )}
        </div>
        {backpacks.length === 0 && settings?.main?.position === "bottom" && <div className="flex-grow" />}
        {backpacks.length > 0 && (
          <div className="flex flex-col flex-grow p-4 sm:p-8 sm:pt-4">
            {backpacks.map((backpack, i) => (
              <Backpack key={i} backpack={backpack} i={i} />
            ))}
          </div>
        )}
        {servicesTopRows?.length > 0 && (
          <div className="@container" ref={containerRef}>
            <div
              className={`grid ${
                columnsMap[settings?.main?.columns || services.length]
              } p-4 sm:p-8 sm:pt-4 items-start pb-0 sm:pb-0 mx-auto`}
              style={{ width: `${widthServices * 100 || 100}%` }}
            >
              {servicesTopRows.map((group) => (
                <ServicesGroup
                  key={group.name}
                  group={group.name}
                  services={group}
                  layout={initialSettings.layout?.[group.name]}
                />
              ))}
              {servicesBottomRows?.length > 0 && (
                <div
                  className={`grid ${
                    columnsMap[
                      servicesBottomRows.filter((g) => {
                        const style = initialSettings.layout?.[g.name]?.style;
                        if (style !== "row" && style !== "auto-row" && style !== "auto-row-center") return true;
                        return false;
                      }).length
                    ]
                  } items-start mx-auto col-span-full w-full`}
                >
                  {servicesBottomRows.map((group) => (
                    <ServicesGroup
                      key={group.name}
                      group={group.name}
                      services={group}
                      layout={initialSettings.layout?.[group.name]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {bookmarks?.length > 0 && (
          <div
            className={`grow flex flex-wrap pt-0 sm:pb-0 p-4 pb-0 sm:p-8 gap-2 grid-cols-1 lg:grid-cols-2 lg:grid-cols-${Math.min(
              6,
              bookmarks.length
            )}`}
          >
            {bookmarks.map((group) =>
              Number.isNaN(parseInt(group?.name, 10)) ? (
                <BookmarksGroup key={group.name} group={group} disableCollapse={settings.disableCollapse} />
              ) : (
                <div key={group.name} />
              )
            )}
          </div>
        )}

        <div className="flex flex-col mt-auto p-8 w-full">
          <div className="flex w-full justify-end">
            {!initialSettings?.color && <ColorToggle />}
            <Revalidate />
            {!initialSettings?.theme && <ThemeToggle />}
          </div>

          <div className="flex mt-4 w-full justify-end">{!initialSettings?.hideVersion && <Version />}</div>
        </div>
      </div>
    </>
  );
}

export default function Wrapper({ initialSettings, fallback }) {
  const wrappedStyle = {};
  let backgroundBlur = false;
  let backgroundSaturate = false;
  let backgroundBrightness = false;
  if (initialSettings && initialSettings.background) {
    let opacity = initialSettings.backgroundOpacity ?? 1;
    let backgroundImage = initialSettings.background;
    if (typeof initialSettings.background === "object") {
      backgroundImage = initialSettings.background.image;
      backgroundBlur = initialSettings.background.blur !== undefined;
      backgroundSaturate = initialSettings.background.saturate !== undefined;
      backgroundBrightness = initialSettings.background.brightness !== undefined;
      if (initialSettings.background.opacity !== undefined) opacity = initialSettings.background.opacity / 100;
    }
    const opacityValue = 1 - opacity;
    wrappedStyle.backgroundImage = `
      linear-gradient(
        rgb(var(--bg-color) / ${opacityValue}),
        rgb(var(--bg-color) / ${opacityValue})
      ),
      ${(backgroundImage && `url(${backgroundImage})`) || ""}`;
    wrappedStyle.backgroundPosition = "center";
    wrappedStyle.backgroundSize = "cover";
  }

  return (
    <div
      id="page_wrapper"
      className={classNames(
        "relative",
        initialSettings.theme && initialSettings.theme,
        initialSettings.color && `theme-${initialSettings.color}`
      )}
    >
      <div
        id="page_container"
        className="fixed overflow-auto w-full h-full bg-theme-50 dark:bg-theme-800 transition-all"
        style={wrappedStyle}
      >
        <div
          id="inner_wrapper"
          className={classNames(
            "fixed overflow-auto w-full h-full",
            backgroundBlur &&
              `backdrop-blur${initialSettings.background.blur.length ? "-" : ""}${initialSettings.background.blur}`,
            backgroundSaturate && `backdrop-saturate-${initialSettings.background.saturate}`,
            backgroundBrightness && `backdrop-brightness-${initialSettings.background.brightness}`
          )}
        >
          <Index initialSettings={initialSettings} fallback={fallback} />
        </div>
      </div>
    </div>
  );
}
