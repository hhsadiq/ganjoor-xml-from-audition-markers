import fs from "fs";
import crypto from "crypto";
import { Builder } from "xml2js";
import path from "path";
import "dotenv/config";
import {
  readPoemAndMarkers,
  PoemDataType,
  CoupletType,
} from "./read-markers-and-poem";

// Global settings
const settings = {
  poemsRootFolder: process.env.POEM_BASE_PATH || "",
  poemsType: process.env.POEM_TYPE || "rubai",
  rangeStart: parseInt(process.env.POEM_START || "1"),
  rangeEnd: parseInt(process.env.POEM_END || "1"),
  ganjoorBaseId: parseInt(process.env.POEM_GANJOOR_BASE_ID || "0"),
};

// Function to generate MD5 checksum
function generateMD5(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("md5");
  hash.update(buffer);
  return hash.digest("hex");
}

export type SyncInfoType = {
  VerseOrder: number;
  AudioMiliseconds: number;
};

const timeStrToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0; // Handle empty/undefined input

  const [minutes, seconds] = timeStr.split(":");
  const result = parseInt(minutes, 10) * 60 + parseFloat(seconds);
  return isNaN(result) ? 0 : result; // Return 0 instead of NaN
};

function generateSyncInfo(couplets: CoupletType[]): SyncInfoType[] {
  const syncInfoArray: SyncInfoType[] = [];
  couplets.forEach((couplet, index) => {
    // Only add entries if we have valid times
    if (
      couplet.coupletStartTime !== undefined &&
      !isNaN(couplet.coupletStartTime)
    ) {
      syncInfoArray.push({
        VerseOrder: index * 2,
        AudioMiliseconds: Math.round(couplet.coupletStartTime * 1000),
      });
    }
    if (couplet.verseEndTime !== undefined && !isNaN(couplet.verseEndTime)) {
      syncInfoArray.push({
        VerseOrder: index * 2 + 1,
        AudioMiliseconds: Math.round(couplet.verseEndTime * 1000),
      });
    }
  });
  return syncInfoArray;
}

// Main processing function
async function processPoemDocument(): Promise<void> {
  for (
    let poemNumber = settings.rangeStart;
    poemNumber <= settings.rangeEnd;
    poemNumber++
  ) {
    const poemFolder = settings.poemsRootFolder;
    const poemData: PoemDataType = await readPoemAndMarkers(poemFolder);
    console.log(poemData);
    const mp3File = `${settings.poemsType}-${poemNumber}.mp3`;
    const mp3FilePath = path.join(poemFolder, mp3File);

    const xmlBuilder = new Builder({ headless: true });
    const description = `فایل صوتی بخش ${poemNumber + 1} - ${
      poemData.poemName
    }`;
    const fileCheckSum = generateMD5(mp3FilePath);

    const poemAudioList = {
      DesktopGanjoorPoemAudioList: {
        PoemAudio: {
          PoemId: settings.ganjoorBaseId + poemNumber,
          Id: 1,
          FilePath: mp3File,
          Description: description,
          FileCheckSum: fileCheckSum,
          OneSecondBugFix: 1000,
          SyncArray: {
            SyncInfo: generateSyncInfo(poemData.couplets),
          },
        },
      },
    };

    const xmlContent = xmlBuilder.buildObject(poemAudioList);
    const outFolder = path.join(poemFolder);
    if (!fs.existsSync(outFolder)) {
      fs.mkdirSync(outFolder);
    }
    fs.writeFileSync(
      path.join(outFolder, `${settings.poemsType}-${poemNumber}.xml`),
      xmlContent
    );

    console.log(
      `XML file for ${settings.poemsType}-${poemNumber} generated successfully`
    );
  }
}

// Call the function (or export it, based on your application structure)
processPoemDocument()
  .then(() => {
    console.log("Process completed.");
  })
  .catch((error) => {
    console.error("Error during process:", error);
  });
