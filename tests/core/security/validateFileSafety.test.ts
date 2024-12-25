import { describe, it, expect, vi } from "vitest";
import { type RepomixConfigMerged } from "../../../src/config/configSchema.js";
import { type RawFile } from "../../../src/core/file/fileTypes.js";
import { type SuspiciousFileResult } from "../../../src/core/security/securityCheck.js";
import { validateFileSafety } from "../../../src/core/security/validateFileSafety.js";
import { type RepomixProgressCallback } from "../../../src/shared/types.js";

describe("validateFileSafety", () => {
  it("should validate file safety and return safe files and paths", async () => {
    const rawFiles: RawFile[] = [
      { path: "file1.txt", content: "content1" },
      { path: "file2.txt", content: "content2" },
      { path: "file3.txt", content: "content3" },
    ];
    const safeRawFiles = [rawFiles[0], rawFiles[1]];
    const config: RepomixConfigMerged = {
      security: { enableSecurityCheck: true },
    } as RepomixConfigMerged;
    const progressCallback: RepomixProgressCallback = vi.fn();
    const suspiciousFilesResults: SuspiciousFileResult[] = [
      { filePath: "file2.txt", messages: ["something suspicious."] },
    ];
    const deps = {
      runSecurityCheckIfEnabled: vi
        .fn()
        .mockResolvedValue(suspiciousFilesResults),
      filterOutUntrustedFiles: vi.fn().mockReturnValue(safeRawFiles),
    };

    const result = await validateFileSafety(
      rawFiles,
      progressCallback,
      config,
      deps
    );

    expect(deps.runSecurityCheckIfEnabled).toHaveBeenCalledWith(
      rawFiles,
      config,
      progressCallback
    );
    expect(deps.filterOutUntrustedFiles).toHaveBeenCalledWith(
      rawFiles,
      suspiciousFilesResults
    );
    expect(result).toEqual({
      safeRawFiles,
      safeFilePaths: ["file1.txt", "file2.txt"],
      suspiciousFilesResults,
    });
  });
});
