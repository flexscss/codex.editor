'use strict';

import {EditorConfig} from '../types';

declare const VERSION: string;

/**
 * Apply polyfills
 */
import '@babel/register';

import 'components/polyfills';
import Core from './components/core';

/**
 * Codex Editor
 *
 * Short Description (눈_눈;)
 * @version 2.0
 *
 * @author CodeX-Team <https://ifmo.su>
 */
export default class CodexEditor {
  /**
   * Promise that resolves when core modules are ready and UI is rendered on the page
   */
  public isReady: Promise<void>;

  /**
   * Stores destroy method implementation.
   * Clear heap occupied by Editor and remove UI components from the DOM.
   */
  public destroy: () => void;

  /** Editor version */
  static get version(): string {
    return VERSION;
  }

  /**
   * @constructor
   *
   * @param {EditorConfig|String|undefined} [configuration] - user configuration
   */
  public constructor(configuration?: EditorConfig|string) {
    /**
     * Set default onReady function
     */
    let onReady = () => {};

    /**
     * If `onReady` was passed in `configuration` then redefine onReady function
     */
    if (typeof configuration === 'object' && typeof configuration.onReady === 'function') {
      onReady = configuration.onReady;
    }

    /**
     * Create a CodeX Editor instance
     */
    const editor = new Core(configuration);

    /**
     * We need to export isReady promise in the constructor
     * as it can be used before other API methods are exported
     * @type {Promise<void>}
     */
    this.isReady = editor.isReady.then(() => {
      this.exportAPI(editor);
      onReady();
    });
  }

  /**
   * Export external API methods
   *
   * @param editor
   */
  public exportAPI(editor: Core): void {
    const fieldsToExport = [ 'configuration' ];
    const destroy = () => {
      editor.moduleInstances.Listeners.removeAll();
      editor.moduleInstances.UI.destroy();
      editor.moduleInstances.ModificationsObserver.destroy();
      editor = null;

      for (const field in this) {
        if (this.hasOwnProperty(field)) {
          delete this[field];
        }
      }

      Object.setPrototypeOf(this, null);
    };

    fieldsToExport.forEach((field) => {
      this[field] = editor[field];
    });

    this.destroy = destroy;

    Object.setPrototypeOf(this, editor.moduleInstances.API.methods);

    delete this.exportAPI;
  }
}
