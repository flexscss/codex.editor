/**
 * Codex Editor Saver
 *
 * @module Saver
 * @author Codex Team
 * @version 2.0.0
 */
import Module from '../__module';
import {OutputData} from '../../../types';

declare const VERSION: string;

/**
 * @classdesc This method reduces all Blocks asyncronically and calls Block's save method to extract data
 *
 * @typedef {Saver} Saver
 * @property {Element} html - Editor HTML content
 * @property {String} json - Editor JSON output
 */
export default class Saver extends Module {
  /**
   * Composes new chain of Promises to fire them alternatelly
   * @return {OutputData}
   */
  public async save(): Promise<OutputData> {
    const blocks = this.Editor.BlockManager.blocks,
      chainData = [];

    blocks.forEach((block) => {
      chainData.push(block.save());
    });

    const extractedData = await Promise.all(chainData);
    const sanitizedData = await this.Editor.Sanitizer.sanitizeBlocks(extractedData);

    return this.makeOutput(sanitizedData);
  }

  /**
   * Creates output object with saved data, time and version of editor
   * @param {Object} allExtractedData
   * @return {OutputData}
   */
  private makeOutput(allExtractedData): OutputData {
    let totalTime = 0;
    const blocks = [];

    console.groupCollapsed('[CodexEditor saving]:');

    allExtractedData.forEach((extraction) => {
      /** Group process info */
      console.log(`«${extraction.tool}» saving info`, extraction);
      totalTime += extraction.time;
      blocks.push({
        type: extraction.tool,
        data: extraction.data,
      });
    });

    console.log('Total', totalTime);
    console.groupEnd();

    return {
      time: +new Date(),
      blocks,
      version: VERSION,
    };
  }
}
