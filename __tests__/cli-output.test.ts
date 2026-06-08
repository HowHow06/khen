import { shouldPrintReportToStdout } from "../scripts/cli/output";

describe("khen-ppt report output policy", () => {
  it("prints JSON when no report file is provided", () => {
    expect(shouldPrintReportToStdout(undefined)).toBe(true);
  });

  it("keeps stdout quiet when a report file is provided", () => {
    expect(shouldPrintReportToStdout("/tmp/report.json")).toBe(false);
  });
});
