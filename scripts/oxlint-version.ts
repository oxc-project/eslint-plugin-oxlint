import axios from "axios";

export async function getLatestOxlintVersion() {
  const tagsUrl = "https://api.github.com/repos/oxc-project/oxc/tags";
  const response = await axios.get(tagsUrl);
  const tags = response.data.map((tag: any) => tag.name);
  const oxlintTags: string[] = tags.filter((tag: string) =>
    tag.startsWith("oxlint_v"),
  );
  const latestVersion = oxlintTags
    .slice(1)
    .reduce((latest: string, current: string) => {
      const latestNumber = parseInt(latest.replace("oxlint_v", ""));
      const currentNumber = parseInt(current.replace("oxlint_v", ""));
      return currentNumber > latestNumber ? current : latest;
    }, oxlintTags[0]);
  return latestVersion;
}
