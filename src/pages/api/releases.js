import cachedFetch from "utils/proxy/cached-fetch";

export default async function handler(req, res) {
  const releasesURL = "https://api.github.com/repos/lukylix/bulby/releases";
  return res.send(await cachedFetch(releasesURL, 5));
}
