import * as cheerio from "cheerio";
import {
  getLatentSpaceLinks,
  putLatentSpaceLinks,
} from "../utils/stores/latent-space-links.js";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getUniqueArrayItems } from "../utils/get-unique-array.js";
import { traceable } from "langsmith/traceable";

async function latentSpaceLoaderFunc(config: LangGraphRunnableConfig) {
  const siteMapUrl = "https://www.latent.space/sitemap/2025";

  const links = await fetch(siteMapUrl)
    .then((response) => response.text())
    .then((html) => {
      const $ = cheerio.load(html);

      const links = $(".sitemap-link")
        .map((_, element) => $(element).attr("href"))
        .get();

      return links;
    });

  const processedLinks = await getLatentSpaceLinks(config);
  const uniqueLinks = getUniqueArrayItems(processedLinks, links);
  const allLinks = Array.from(new Set([...processedLinks, ...uniqueLinks]));

  await putLatentSpaceLinks(allLinks, config);

  return uniqueLinks;
}

export const latentSpaceLoader = traceable(latentSpaceLoaderFunc, { name: "latent-space-loader" });
