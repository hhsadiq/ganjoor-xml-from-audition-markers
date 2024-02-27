import fs from 'fs';
import 'dotenv/config';

type Marker = {
  marker: string;
  start: string;
  timeFormat: string;
};

export type CoupletType = {
  number: number;
  coupletStartTime: number;
  coupletEndTime: number;
  verseStartTime: number;
  verseEndTime: number;
  persian1: string;
  persian2: string;
  urdu: string;
  english: string;
};

export type PoemDataType = {
  bookName: string;
  poemName: string;
  poemType: string;
  couplets: CoupletType[];
  totalCouplets: number;
  outroStart: number;
  outroEnd: number;
};

export type PoemDataSingleObjType = {
  data?: PoemDataType | null,
};

function readPoemFileSync(filePath: string): string {
  try {
    if (!filePath) {
      throw new Error('File path is not provided.');
    }

    const data = fs.readFileSync(filePath, 'utf8');
    // Process the data as needed
    return data;
  } catch (error) {
    console.error(`Error reading file from path "${filePath}":`, error);
    throw error; // or handle it as needed
  }
}


export async function processPoemDocumentv2(): Promise<PoemDataType> {
  try {
    const inputText = readPoemFileSync(process.env.POEM_TEXT_FILE as string);

    // Process the markers file
    const markersText = readPoemFileSync(process.env.POEM_MARKERS_FILE as string);

    const markers: Marker[] = markersText.trim().split('\n').slice(1).map(line => {
      const separator = line.includes('\t') ? '\t' : ',';
      const [marker, start, , timeFormat] = line.split(separator);
      return { marker, start, timeFormat };
    });

    // Utility function to convert time string to decimal
    const timeStrToDecimal = (timeStr: string): number => {
      const [minutes, seconds] = timeStr.split(':');
      return parseInt(minutes, 10) * 60 + parseFloat(seconds);
    };

    // Creating a dictionary for marker times
    const markerTimes: { [key: string]: number } = {};
    markers.forEach(({ marker, start }) => {
      markerTimes[marker] = timeStrToDecimal(start);
    });

    // Extracting book, poem names, and poem type
    const bookNameMatch = inputText.match(/#BookName:\s*([\s\S]*?)\n/);
    const poemNameMatch = inputText.match(/#PoemName:\s*([\s\S]*?)\n/);
    const poemTypeMatch = inputText.match(/#PoemType:\s*([\s\S]*?)\n/);
    const bookName = bookNameMatch ? bookNameMatch[1].trim() : "Book Name Not Found";
    const poemName = poemNameMatch ? poemNameMatch[1].trim() : "Poem Name Not Found";
    const poemType = poemTypeMatch ? poemTypeMatch[1].trim() : "Poem Type Not Found";

    // Processing couplets
    const coupletMatches = inputText.split('#v').slice(1);
    const couplets: CoupletType[] = coupletMatches.map((coupletMatch, index) => {
      const lines = coupletMatch.trim().split('\n').map(line => line.trim());
      const persian1 = lines[0];
      const persian2 = lines[1];
      const urdu = lines[2];
      const english = lines[3];

      return {
        number: index + 1,
        coupletStartTime: markerTimes[`${index + 1}a`],
        coupletEndTime: markerTimes[`${index + 2}a`] || markerTimes['ea'], // Use next couplet's start time or end slide start time
        verseStartTime: markerTimes[`${index + 1}b`],
        verseEndTime: markerTimes[`${index + 1}c`],
        persian1,
        persian2,
        urdu,
        english
      };
    });

    // Constructing the final poem data
    const poemData: PoemDataType = {
      bookName,
      poemName,
      poemType,
      couplets,
      totalCouplets: couplets.length,
      outroStart: markerTimes['ea'],
      outroEnd: markerTimes['eb']
    };

    return poemData;
  } catch (error) {
    console.error('Error reading input file', error);
    throw new Error('Error reading input file');
  }
}
