/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { Ajax } from "../modules/Ajax";
import { Uploader } from "../modules/Uploader";

export type UploaderData = {
    messages?: string[],
    files?: string[],
    isImages?: boolean[],
    path?: string,
    baseurl?: string,
    newfilename?: string;
};

export type UploaderAnswer = {
    success: boolean,
    time: string,
    data: UploaderData
};

export type HandlerSuccess = (resp: UploaderData) => void;
export type HandlerError = (e: Error) => void;
export type BuildDataResult = FormData | {[key: string]: string} | Promise<FormData | {[key: string]: string}> | string;

/**
 * @property {object} uploader {@link Uploader|Uploader}'s settings
 * @property {string} uploader.url Point of entry for file uploader
 * @property {string} uploader.format='json' The format of the received data
 * @property {string} uploader.headers=null An object of additional header key/value pairs toWYSIWYG send along with requests using the XMLHttpRequest transport. See {@link Ajax.defaultAjaxOptions|Ajax.defaultAjaxOptions}
 * @property {function} uploader.prepareData Before send file will called this function. First argument it gets [new FormData ()](https://developer.mozilla.org/en/docs/Web/API/FormData), you can use this if you want add some POST parameter.
 * @property {object|boolean} uploader.data=false POST parameters.
 * @example
 * ```javascript
 * new Jodit('#editor', {
 *      uploader: {
 *          prepareData: function (formdata) {
 *              formdata.append('id', 24); // $_POST['id'] on server
 *              formdata.append('name', 'Some parameter');  // $_POST['name'] on server
 *          }
 *      }
 * });
 * ```
 * @property {function} uploader.isSuccess Check if received data was positive
 * @property {function} uploader.getMessage If you need display a message use this
 * @property {function(data)} uploader.process The method of processing data received from the server. Must return this PlainObject format `{
 * {
 *     files: resp.files || [], // {array} The names of uploaded files.
 *     path: resp.path, // {string} Real relative path
 *     baseurl: resp.baseurl, // {string} Base url for filebrowser
 *     error: resp.error, // {int}
 *     msg: resp.msg // {string}
 * };`
 * @property {function} uploader.error Process negative situation. For example file wasn't uploaded because of file permoission
 * @property {function} uploader.defaultHandlerSuccess Default success result processor. In first param it get `uploader.process` result
 * @property {function} uploader.defaultHandlerError Default error result processor
 *
 * @example
 * ```javascript
 * var editor = new Jodit('#editor', {
 *     uploader: {
 *         url: 'connector/index.php?action=upload',
 *         format: 'json',
 *         headers: {
 *             'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
 *         },
 *         prepareData: function (data) {
 *             data.append('id', 24); //
 *         },
 *         buildData: function (data) {
 *             return {some: 'data'}
 *         },
 *         data: {
 *              csrf: document.querySelector('meta[name="csrf-token"]').getAttribute('content')
 *         }
 *         isSuccess: function (resp) {
 *             return !resp.error;
 *         },
 *         getMessage: function (resp) {
 *             return resp.msg;
 *         },
 *         process: function (resp) {
 *              return {
 *                  files: resp.files || [],
 *                  path: resp.path,
 *                  baseurl: resp.baseurl,
 *                  error: resp.error,
 *                  msg: resp.msg
 *              };
 *         },
 *        defaultHandlerSuccess: function (data, resp) {
 *            var i, field = 'files';
 *            if (data[field] && data[field].length) {
 *                for (i = 0; i < data[field].length; i += 1) {
 *                    this.selection.insertImage(data.baseurl + data[field][i]);
 *                }
 *            }
 *         },
 *         error: function (e) {
 *             this.events.fire('errorMessage', [e.getMessage(), 'error', 4000])
 *         }
 *     }
 * })
 * ```
 * @example
 * ```javascript
 * var editor = new Jodit('#editor', {
 *     uploader: {
 *          url: 'https://xdsoft.net/jodit/connector/index.php?action=fileUpload',
 *          queryBuild: function (data) {
 *              return JSON.stringify(data);
 *          },
 *          contentType: function () {
 *              return 'application/json';
 *          },
 *          buildData: function (data) {
 *              return {hello: 'Hello world'}
 *          }
 *      },
 * });
 * ```
 * @example
 * // buildData can return Promise
 * // this example demonstrate how send file like as base64 text. Work only in Firefox and Chrome
 * var editor = new Jodit('#editor',  {
 *      uploader: {
 *          url: 'index.php?action=fileUpload',
 *          queryBuild: function (data) {
 *              return JSON.stringify(data);
 *          },
 *          contentType: function () {
 *              return 'application/json';
 *          },
 *          buildData: function (data) {
 *              return new Promise(function (resolve, reject) {
 *                  var reader = new FileReader();
 *                  reader.readAsDataURL(data.getAll('files[0]')[0]);
 *                  reader.onload = function  () {
 *                      return resolve({
 *                          image: reader.result
 *                      });
 *                  };
 *                  reader.onerror =  function  (error) {
 *                      reject(error);
 *                  }
 *              });
 *          }
 *      },
 *  });
 */
export type UploaderOptions = {
    url: string;
    insertImageAsBase64URI: boolean;
    imagesExtensions: string[];
    headers?: {[key: string]: string} | null,
    data: null|object,
    format: string;

    prepareData: (this: Uploader, formData: FormData) => any;
    buildData?: (this: Uploader, formData: any) => BuildDataResult;
    queryBuild?: (this: Ajax, obj: string | {[key: string] : string | object} | FormData, prefix?: string) => string | object;

    isSuccess: (this: Uploader, resp: UploaderAnswer) => boolean;

    getMessage: (this: Uploader, resp: UploaderAnswer) => string;

    process: (this: Uploader, resp: UploaderAnswer) => UploaderData;

    error: (this: Uploader, e: Error) => void;

    defaultHandlerSuccess:  HandlerSuccess;
    defaultHandlerError: HandlerError;

    contentType: (this: Uploader, requestData: any) => string | false;
};
