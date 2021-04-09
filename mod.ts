const decoder = new TextDecoder();
const encoder = new TextEncoder();

// deno-lint-ignore no-explicit-any
declare var Deno: any;
// deno-lint-ignore no-explicit-any
declare var require: any;

/**
 * The structure of items in the json_output property.
 *
 * file
 *
 *     The file in question.
 *
 * members
 *
 *     The members in the file in question.
 */
interface IJsonOutput {
  file: string;
  members: string[];
}

/**
 * Parse data member doc blocks and signatures and place them in a minimalistic,
 * JSON format.
 *
 * Regex Note 1: The initial expression which matches /**\n.
 * Regex Note 2: After the initial expression, keep going until one of the
 * following groups is matched. For example, "Hey regex, find /** and keep going
 * until you find {}.  Stop at {} and do not include it in what you have
 * matched." The groups to stop at are as follows:
 *
 *   - (\n\n)  -->  double NL
 *   - ( {}\n) -->  {} followed by a NL
 *   - ( {\n$) -->  { followed by a NL where the NL is the end of the line
 *   - ( = {)  -->  = {
 *   - (\n$)   -->  a new line where the NL is the end of the line
 */
export class Docable {
  /**
   * A property to hold the list of file paths containing doc block info that
   * will be written in the json_output property.
   */
  protected filepaths: string[];

  /**
   * A property to hold the JSON that is written in the output file.
   */
  protected json_output: { [k: string]: IJsonOutput } = {};

  ///////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR //////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param filepaths - An array of filepaths to check for doc blocks.
   * @param outputFilepath - The filepath that this script will write to.
   */
  constructor(filepaths: string[]) {
    this.filepaths = filepaths;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC /////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Run this script.
   *
   * @returns Doc blocks in JSON format.
   */
  public run(): {[key: string]: IJsonOutput} | void {
    for (const index in this.filepaths) {
      const filepath = this.filepaths[index];

      const fileContents = this.getFileContents(filepath);

      // Get the full member name and only continue with the script if it's found
      const fullMemberName = this.getFullMemberName(fileContents);
      if (!fullMemberName) {
        console.log(
          `File "${filepath}" is missing the "// docable-member-namespace:" comment at the top of the file.`,
        );
        return;
      }

      const members = this.getAllDataMembers(fileContents);

      if (!members) {
        console.log(`File "${filepath}" does not have any doc blocks.`);
        return;
      }

      this.json_output[fullMemberName as string] = {
        file: filepath,
        members: [],
      };

      (members as string[]).forEach((member: string) => {
        // We want to clean up the output of the JSON so we remove unnecessary
        // whitespace here
        member = member
          .replace(/\s+\*/g, " *")
          .replace(/\s+\*/g, " *")
          .replace(/\s+protected/g, "protected")
          .replace(/\s+private/g, "private")
          .replace(/\s+public/g, "public")
          .replace(/\s+constructor/g, "constructor");

        this.json_output[fullMemberName as string].members.push(member);
      });
    }

    console.log(JSON.stringify(this.json_output, null, 2));
  }

  ///////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED //////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Get all data members in the file contents in question.
   *
   * @param fileContents - The file contents containing the data members.
   *
   * @returns False if there are no members; an array of members if any.
   */
  protected getAllDataMembers(fileContents: string): boolean | string[] {
    const members = fileContents
      .match(/\/\*\*\n[\s\S]*?(?=((\n\n)|( {}\n)|( {\n$)|( = {)|(\n$)))/g);
    //       \_______________/\_______________________________________/
    //          |                          |
    //          v                          v
    //      See Regex Note 1            See Regex Note 2
    //      at top of file              at top of file

    if (!members) {
      return false;
    }

    return members;
  }

  /**
   * Get the file contents of the filepath in question.
   *
   * @param filepath - A filepath (e.g., /some/file/path.extension).
   *
   * @returns The contents.
   */
  protected getFileContents(filepath: string): string {
    let ret = "";

    if (globalThis.Deno) {
      ret = decoder.decode(Deno.readFileSync(filepath));
    } else {
      const fs = require("fs");
      ret = decoder.decode(fs.readFileSync(filepath));
    }

    return ret;
  }

  /**
   * Get the member's full name from the contents in question (e.g.,
   * Drash.Http.Server).
   *
   * @param fileContents - The file contents containing the member's full name.
   * The member's full name should be in a comment like the following:
   *
   *     /// Member: Drash.Http.Server
   *
   * @returns The member's full name.
   */
  protected getFullMemberName(fileContents: string): boolean | string {
    const fullMemberNameMatch = fileContents.match(/\/\/ docable-member-namespace:.+/g);

    if (!fullMemberNameMatch) {
      return false;
    }

    return fullMemberNameMatch[0].replace("// docable-member-namespace: ", "");
  }
}

