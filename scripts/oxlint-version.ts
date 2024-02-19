import axios from "axios";

export async function getLatestOxlintVersion(): Promise<string> {
  const tagsUrl = "https://api.github.com/repos/oxc-project/oxc/tags";
  const { data } = await axios.get<Array<{ name: string }>>(tagsUrl);
  const tags = data.map((tag) => tag.name);
  const oxlintTags = tags.filter((tag) => tag.startsWith("oxlint_v"));
  const latestVersion = oxlintTags
    .slice(1)
    .reduce((latest: string, current: string) => {
      const latestNumber = parseInt(latest.replace("oxlint_v", ""));
      const currentNumber = parseInt(current.replace("oxlint_v", ""));
      return currentNumber > latestNumber ? current : latest;
    }, oxlintTags[0]);
  return latestVersion;
}
