import fs from 'fs';
import crypto from 'crypto';
import { Builder } from 'xml2js';
import path from 'path';
import 'dotenv/config';
import { readPoemAndMarkers, PoemDataType, CoupletType } from './read-markers-and-poem';

// Global settings
const settings = {
  poemsRootFolder: process.env.POEM_BASE_PATH || '',
  rubaiRangeStart: parseInt(process.env.POEM_START || '1'),
  rubaiRangeEnd: parseInt(process.env.POEM_END || '1'),
  ganjoorBaseId: parseInt(process.env.POEM_GANJOOR_BASE_ID || '0')
};

// Function to generate MD5 checksum
function generateMD5(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

export type SyncInfoType = {
  VerseOrder: number;
  AudioMilliseconds: number;
};

function generateSyncInfo(couplets: CoupletType[]): SyncInfoType[] {
  const syncInfoArray: SyncInfoType[] = [];

  couplets.forEach((couplet, index) => {
    // Assuming the first verse corresponds to the 'persian1' field
    syncInfoArray.push({
      VerseOrder: index * 2, // Even index for the first verse of each couplet
      AudioMilliseconds: couplet.coupletStartTime * 1000
    });

    // Assuming the second verse corresponds to the 'persian2' field
    syncInfoArray.push({
      VerseOrder: index * 2 + 1, // Odd index for the second verse of each couplet
      AudioMilliseconds: couplet.verseEndTime * 1000
    });
  });

  return syncInfoArray;
}

// Main processing function
async function processPoemDocument(): Promise<void> {

  for (let rubaiNumber = settings.rubaiRangeStart; rubaiNumber <= settings.rubaiRangeEnd; rubaiNumber++) {
    const rubaiFolder = path.join(settings.poemsRootFolder, `/rubai-${rubaiNumber}`);
    const poemData: PoemDataType = await readPoemAndMarkers(rubaiFolder);
    const mp3File = `rubai-${rubaiNumber}.mp3`;
    const mp3FilePath = path.join(rubaiFolder, mp3File);

    const xmlBuilder = new Builder();
    const description = `فایل صوتی بخش ${rubaiNumber + 1} - ${poemData.poemName}`;
    const fileCheckSum = generateMD5(mp3FilePath);

    const poemAudioList = {
      DesktopGanjoorPoemAudioList: {
        PoemAudio: {
          PoemId: settings.ganjoorBaseId + rubaiNumber,
          Id: rubaiNumber,
          FilePath: mp3File,
          Description: description,
          FileCheckSum: fileCheckSum,
          OneSecondBugFix: 1000,
          SyncArray: {
            SyncInfo: generateSyncInfo(poemData.couplets)
          }
        }
      }
    };

    const xmlContent = xmlBuilder.buildObject(poemAudioList);
    const outFolder = path.join(rubaiFolder);
    if (!fs.existsSync(outFolder)) {
      fs.mkdirSync(outFolder);
    }
    fs.writeFileSync(path.join(outFolder, `rubai-${rubaiNumber}.xml`), xmlContent);

    console.log(`XML file for rubai-${rubaiNumber} generated successfully`);
  }
}

// Call the function (or export it, based on your application structure)
processPoemDocument().then(() => {
  console.log('Process completed.');
}).catch(error => {
  console.error('Error during process:', error);
});
