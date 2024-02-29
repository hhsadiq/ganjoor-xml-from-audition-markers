
# Ganjoor XML Generator

This project automates the generation of XML files for Ganjoor from Audition markers files and corresponding sample poem inputs. The XML files adhere to the specifications required by Ganjoor for proper integration.

## Overview

The script processes text and marker CSV files to extract poem data and sync information. It then generates an XML file per poem, formatted according to Ganjoor's XML schema for poem audio sync.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher recommended)
- npm (usually comes with Node.js)

## Project Setup

1. Clone the repository to your local machine.

2. Navigate to the project directory and install the dependencies:

```bash
npm install
```

3. Configure the environment variables by creating a `.env` file in the root of the project with the following content:

```env
POEM_BASE_PATH=<path_to_poems_folder>
POEM_START=<starting_rubai_number>
POEM_END=<ending_rubai_number>
POEM_GANJOOR_BASE_ID=<base_id_for_ganjoor>
POEM_TEXT_FILE='<path_to_poem_text_file>'
POEM_MARKERS_FILE='<path_to_markers_csv_file>'
```

Replace the placeholders with the actual values. For example:

```env
POEM_BASE_PATH=/Users/username/Music/Poems
POEM_START=1
POEM_END=10
POEM_GANJOOR_BASE_ID=39699
POEM_TEXT_FILE='/poem.txt'
POEM_MARKERS_FILE='/markers.csv'
```

4. The input files should be named appropriately and placed in the specified `POEM_BASE_PATH` directory.

## Usage

To run the script and generate XML files, execute the following command:

```bash
npm start
```

The script will read the data from the specified text and CSV files, and output XML files in the corresponding rubai/poem directory within the `POEM_BASE_PATH` folder.

## Input Files

- `poem.txt`: This file should contain the text of the poem, formatted with special markers for book name, poem name, and each couplet.
- `markers.csv`: This CSV file should list the markers from the audio file with timestamps to synchronize the audio with the text.

## Output

The XML files will be saved in the `/rubai-{num}` directory with the name format `rubai-<number>.xml`. Each XML file corresponds to a rubai specified by the range in the `.env` file.

## Troubleshooting

If the XML files are not generated as expected, please check the following:

- The `.env` file is properly configured with the correct paths and range.
- The input files are in the correct format and encoding.
- Node.js and npm are correctly installed and up to date.

For further assistance, raise an issue in the project's issue tracker.

## Contributing

Contributions to the project are welcome. Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for more details.
