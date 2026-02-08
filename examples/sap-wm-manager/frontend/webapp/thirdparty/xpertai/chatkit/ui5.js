(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof sap.ui.define === "function" && sap.ui.define.amd ? sap.ui.define("xpertai/chatkit/ui5", ["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.XpertChatkitUI5 = {}));
})(this, function(exports2) {
  "use strict";
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart = (base) => [, , , __create((base == null ? void 0 : base[__knownSymbol("metadata")]) ?? null)];
  var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
  var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
  var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
  var __runInitializers = (array, flags, self2, value) => {
    for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self2);
    return value;
  };
  var __decorateElement = (array, flags, name, decorators, target, extra) => {
    var it, done, ctx, access, k = flags & 7, s = false, p = false;
    var j = 2, key = __decoratorStrings[k + 5];
    var extraInitializers = array[j] || (array[j] = []);
    var desc = (target = target.prototype, __getOwnPropDesc(target, name));
    for (var i = decorators.length - 1; i >= 0; i--) {
      ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
      {
        ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
        access.get = (x) => x[name];
      }
      it = (0, decorators[i])(desc[key], ctx), done._ = 1;
      __expectFn(it) && (desc[key] = it);
    }
    return desc && __defProp(target, name, desc), target;
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var _setTrainingOptOut_dec, _hideHistory_dec, _showHistory_dec, _sendCustomAction_dec, _shareThread_dec, _setThreadId_dec, _setComposerValue_dec, _sendUserMessage_dec, _fetchUpdates_dec, _focusComposer_dec, _a2, _opts, _frameUrl, _frame, _wrapper, _shadow, _resolveLoaded, _loaded, _messenger, _ChatKitElementBase_instances, emitAndThrow_fn, setOptionsDataAttributes_fn, getFrameUrl_fn, setFrameUrl_fn, consumeFrameUrl_fn, _handleFrameLoad, _initialized, maybeInit_fn, _init;
  var __defProp2 = Object.defineProperty;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  var _a, _b;
  class EventEmitter {
    constructor() {
      __publicField(this, "callbacks", /* @__PURE__ */ new Map());
    }
    on(event, callback) {
      if (!this.callbacks.has(event)) {
        this.callbacks.set(event, /* @__PURE__ */ new Set());
      }
      this.callbacks.get(event).add(callback);
    }
    emit(event, ...args) {
      var _a22;
      const data = args[0];
      (_a22 = this.callbacks.get(event)) == null ? void 0 : _a22.forEach((callback) => callback(data));
    }
    off(event, callback) {
      var _a22;
      if (!callback) {
        this.callbacks.delete(event);
      } else {
        (_a22 = this.callbacks.get(event)) == null ? void 0 : _a22.delete(callback);
      }
    }
    allOff() {
      this.callbacks.clear();
    }
  }
  async function getBytes(stream, onChunk) {
    const reader = stream.getReader();
    let result;
    while (!(result = await reader.read()).done) {
      onChunk(result.value);
    }
  }
  function getLines(onLine) {
    let buffer;
    let position;
    let fieldLength;
    let discardTrailingNewline = false;
    return function onChunk(arr) {
      if (buffer === void 0) {
        buffer = arr;
        position = 0;
        fieldLength = -1;
      } else {
        buffer = concat(buffer, arr);
      }
      const bufLength = buffer.length;
      let lineStart = 0;
      while (position < bufLength) {
        if (discardTrailingNewline) {
          if (buffer[position] === 10) {
            lineStart = ++position;
          }
          discardTrailingNewline = false;
        }
        let lineEnd = -1;
        for (; position < bufLength && lineEnd === -1; ++position) {
          switch (buffer[position]) {
            case 58:
              if (fieldLength === -1) {
                fieldLength = position - lineStart;
              }
              break;
            case 13:
              discardTrailingNewline = true;
            case 10:
              lineEnd = position;
              break;
          }
        }
        if (lineEnd === -1) {
          break;
        }
        onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
        lineStart = position;
        fieldLength = -1;
      }
      if (lineStart === bufLength) {
        buffer = void 0;
      } else if (lineStart !== 0) {
        buffer = buffer.subarray(lineStart);
        position -= lineStart;
      }
    };
  }
  function getMessages(onId, onRetry, onMessage) {
    let message = newMessage();
    const decoder = new TextDecoder();
    return function onLine(line, fieldLength) {
      if (line.length === 0) {
        onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
        message = newMessage();
      } else if (fieldLength > 0) {
        const field = decoder.decode(line.subarray(0, fieldLength));
        const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
        const value = decoder.decode(line.subarray(valueOffset));
        switch (field) {
          case "data":
            message.data = message.data ? message.data + "\n" + value : value;
            break;
          case "event":
            message.event = value;
            break;
          case "id":
            onId(message.id = value);
            break;
          case "retry":
            const retry = parseInt(value, 10);
            if (!isNaN(retry)) {
              onRetry(message.retry = retry);
            }
            break;
        }
      }
    };
  }
  function concat(a, b) {
    const res = new Uint8Array(a.length + b.length);
    res.set(a);
    res.set(b, a.length);
    return res;
  }
  function newMessage() {
    return {
      data: "",
      event: "",
      id: "",
      retry: void 0
    };
  }
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  const EventStreamContentType = "text/event-stream";
  const DefaultRetryInterval = 1e3;
  const LastEventId = "last-event-id";
  function fetchEventSource(input, _a22) {
    var { signal: inputSignal, headers: inputHeaders, onopen: inputOnOpen, onmessage, onclose, onerror, openWhenHidden, fetch: inputFetch } = _a22, rest = __rest(_a22, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
    return new Promise((resolve, reject) => {
      const headers = Object.assign({}, inputHeaders);
      if (!headers.accept) {
        headers.accept = EventStreamContentType;
      }
      let curRequestController;
      function onVisibilityChange() {
        curRequestController.abort();
        if (!document.hidden) {
          create();
        }
      }
      if (!openWhenHidden) {
        document.addEventListener("visibilitychange", onVisibilityChange);
      }
      let retryInterval = DefaultRetryInterval;
      let retryTimer = 0;
      function dispose() {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.clearTimeout(retryTimer);
        curRequestController.abort();
      }
      inputSignal === null || inputSignal === void 0 ? void 0 : inputSignal.addEventListener("abort", () => {
        dispose();
        resolve();
      });
      const fetch2 = inputFetch !== null && inputFetch !== void 0 ? inputFetch : window.fetch;
      const onopen = inputOnOpen !== null && inputOnOpen !== void 0 ? inputOnOpen : defaultOnOpen;
      async function create() {
        var _a3;
        curRequestController = new AbortController();
        try {
          const response = await fetch2(input, Object.assign(Object.assign({}, rest), { headers, signal: curRequestController.signal }));
          await onopen(response);
          await getBytes(response.body, getLines(getMessages((id) => {
            if (id) {
              headers[LastEventId] = id;
            } else {
              delete headers[LastEventId];
            }
          }, (retry) => {
            retryInterval = retry;
          }, onmessage)));
          onclose === null || onclose === void 0 ? void 0 : onclose();
          dispose();
          resolve();
        } catch (err) {
          if (!curRequestController.signal.aborted) {
            try {
              const interval = (_a3 = onerror === null || onerror === void 0 ? void 0 : onerror(err)) !== null && _a3 !== void 0 ? _a3 : retryInterval;
              window.clearTimeout(retryTimer);
              retryTimer = window.setTimeout(create, interval);
            } catch (innerErr) {
              dispose();
              reject(innerErr);
            }
          }
        }
      }
      create();
    });
  }
  function defaultOnOpen(response) {
    const contentType = response.headers.get("content-type");
    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith(EventStreamContentType))) {
      throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
    }
  }
  const FRAME_SAFE_ERROR_KEY = "__chatkit_error__";
  class HttpError extends Error {
    constructor(message, res, metadata) {
      super(message);
      __publicField(this, "status");
      __publicField(this, "statusText");
      __publicField(this, "metadata");
      this.name = "HttpError";
      this.statusText = res.statusText;
      this.status = res.status;
      this.metadata = metadata;
    }
    static fromPossibleFrameSafeError(error) {
      if (error instanceof HttpError) {
        return error;
      }
      if (error && typeof error === "object" && FRAME_SAFE_ERROR_KEY in error && error[FRAME_SAFE_ERROR_KEY] === "HttpError") {
        const safeError = error;
        const parsedError = new HttpError(
          safeError.message,
          {
            status: safeError.status,
            statusText: safeError.statusText
          },
          safeError.metadata
        );
        parsedError.stack = safeError.stack;
        return parsedError;
      }
      return null;
    }
  }
  _a = FRAME_SAFE_ERROR_KEY;
  const _FrameSafeHttpError = class _FrameSafeHttpError2 {
    constructor(message, res, metadata) {
      __publicField(this, _a, "HttpError");
      __publicField(this, "message");
      __publicField(this, "stack");
      __publicField(this, "status");
      __publicField(this, "statusText");
      __publicField(this, "metadata");
      this.message = message;
      this.stack = new Error(message).stack;
      this.status = res.status;
      this.statusText = res.statusText;
      this.metadata = metadata;
    }
    static fromHttpError(error) {
      return new _FrameSafeHttpError2(
        error.message,
        {
          status: error.status,
          statusText: error.statusText
        },
        error.metadata
      );
    }
  };
  let FrameSafeHttpError = _FrameSafeHttpError;
  const BASE_RETRY_DELAY_MS = 1e3;
  const MAX_RETRY_DELAY_MS = 1e4;
  const MAX_RETRY_ATTEMPTS = 5;
  const nextDelay = (attempt, maxRetryDelay = MAX_RETRY_DELAY_MS, baseDelayMs = BASE_RETRY_DELAY_MS) => {
    const max = Math.min(maxRetryDelay, baseDelayMs * 2 ** attempt);
    return Math.floor(max * (0.5 + Math.random() * 0.5));
  };
  class RetryableError extends Error {
    constructor(cause) {
      super();
      this.cause = cause;
    }
  }
  const fetchEventSourceWithRetry = async (url, params) => {
    let retryAttempt = 0;
    const { onopen, ...restParams } = params;
    await fetchEventSource(url, {
      ...restParams,
      onopen: async (res) => {
        var _a22;
        onopen == null ? void 0 : onopen(res);
        if (res.ok && ((_a22 = res.headers.get("content-type")) == null ? void 0 : _a22.startsWith("text/event-stream"))) {
          retryAttempt = 0;
          return;
        }
        const httpError = new FrameSafeHttpError(`Streaming failed: ${res.statusText}`, res);
        if (res.status >= 400 && res.status < 500) {
          throw httpError;
        } else {
          throw new RetryableError(httpError);
        }
      },
      onerror: (error) => {
        if (error instanceof RetryableError) {
          if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
            throw error.cause;
          }
          retryAttempt += 1;
          return nextDelay(retryAttempt);
        }
        throw error;
      }
    });
  };
  let IntegrationError$1 = class IntegrationError extends Error {
    constructor(message) {
      super(message);
      __publicField(this, "_name");
      this.name = "IntegrationError";
      this._name = this.name;
    }
    static fromPossibleFrameSafeError(error) {
      if (error && typeof error === "object" && FRAME_SAFE_ERROR_KEY in error && error[FRAME_SAFE_ERROR_KEY] === "IntegrationError") {
        const safeError = error;
        const parsedError = new IntegrationError(safeError.message);
        parsedError.stack = safeError.stack;
        return parsedError;
      }
      return null;
    }
  };
  _b = FRAME_SAFE_ERROR_KEY;
  class FrameSafeIntegrationError {
    constructor(message) {
      __publicField(this, _b, "IntegrationError");
      __publicField(this, "message");
      __publicField(this, "stack");
      this.message = message;
      this.stack = new Error(message).stack;
    }
  }
  class BaseMessenger {
    constructor({
      handlers,
      target,
      targetOrigin,
      fetch: fetch2 = window.fetch
    }) {
      __publicField(this, "targetOrigin");
      __publicField(this, "target");
      __publicField(this, "commandHandlers");
      __publicField(this, "_fetch");
      __publicField(this, "emitter", new EventEmitter());
      __publicField(this, "handlers", /* @__PURE__ */ new Map());
      __publicField(this, "fetchEventSourceHandlers", /* @__PURE__ */ new Map());
      __publicField(this, "abortControllers", /* @__PURE__ */ new Map());
      __publicField(this, "commands", new Proxy(
        {},
        {
          get: (_, command) => {
            return (data, transfer) => {
              return new Promise((resolve, reject) => {
                const nonce = crypto.randomUUID();
                this.handlers.set(nonce, { resolve, reject, stack: new Error().stack || "" });
                this.sendMessage(
                  {
                    type: "command",
                    nonce,
                    command: `on${command.charAt(0).toUpperCase()}${command.slice(1)}`,
                    data
                  },
                  transfer
                );
              });
            };
          }
        }
      ));
      __publicField(this, "handleMessage", async (event) => {
        var _a22, _b2, _c, _d;
        if (!event.data || event.data.__xpaiChatKit !== true || event.origin !== this.targetOrigin || event.source !== this.target()) {
          return;
        }
        const data = event.data;
        switch (data.type) {
          case "event": {
            this.emitter.emit(data.event, data.data);
            break;
          }
          case "fetch": {
            try {
              if (data.formData) {
                const formData = new FormData();
                for (const [key, value] of Object.entries(data.formData)) {
                  formData.append(key, value);
                }
                data.params.body = formData;
              }
              const controller = new AbortController();
              this.abortControllers.set(data.nonce, controller);
              data.params.signal = controller.signal;
              const res = await this._fetch(data.url, data.params);
              if (!res.ok) {
                const message = await res.json().then((json2) => json2.message || res.statusText).catch(() => res.statusText);
                throw new FrameSafeHttpError(message, res);
              }
              const json = await res.json().catch(() => ({}));
              this.sendMessage({
                type: "response",
                response: json,
                nonce: data.nonce
              });
            } catch (error) {
              this.sendMessage({
                type: "response",
                error,
                nonce: data.nonce
              });
            }
            break;
          }
          case "fetchEventSource": {
            try {
              const controller = new AbortController();
              this.abortControllers.set(data.nonce, controller);
              await fetchEventSourceWithRetry(data.url, {
                ...data.params,
                signal: controller.signal,
                fetch: this._fetch,
                onmessage: (message) => {
                  this.sendMessage({
                    type: "fetchEventSourceMessage",
                    message,
                    nonce: data.nonce
                  });
                }
              });
              this.sendMessage({
                type: "response",
                response: void 0,
                nonce: data.nonce
              });
            } catch (error) {
              this.sendMessage({
                type: "response",
                error,
                nonce: data.nonce
              });
            }
            break;
          }
          case "command": {
            console.log("Received command", data.command, data.data);
            if (!this.canReceiveCommand(data.command)) {
              this.sendMessage({
                type: "response",
                error: new FrameSafeIntegrationError(`Command ${data.command} not supported`),
                nonce: data.nonce
              });
              return;
            }
            try {
              const response = await ((_b2 = (_a22 = this.commandHandlers)[data.command]) == null ? void 0 : _b2.call(_a22, data.data));
              this.sendMessage({
                type: "response",
                response,
                nonce: data.nonce
              });
            } catch (error) {
              this.sendMessage({
                type: "response",
                error,
                nonce: data.nonce
              });
            }
            break;
          }
          case "response": {
            const handler = this.handlers.get(data.nonce);
            if (!handler) {
              console.error("No handler found for nonce", data.nonce);
              return;
            }
            if (data.error) {
              const integrationError = IntegrationError$1.fromPossibleFrameSafeError(data.error);
              const httpError = HttpError.fromPossibleFrameSafeError(data.error);
              if (integrationError) {
                integrationError.stack = handler.stack;
                handler.reject(integrationError);
              } else if (httpError) {
                handler.reject(httpError);
              } else {
                handler.reject(data.error);
              }
            } else {
              handler.resolve(data.response);
            }
            this.handlers.delete(data.nonce);
            break;
          }
          case "fetchEventSourceMessage": {
            const handler = this.fetchEventSourceHandlers.get(data.nonce);
            if (!handler) {
              console.error("No handler found for nonce", data.nonce);
              return;
            }
            (_d = (_c = this.fetchEventSourceHandlers.get(data.nonce)) == null ? void 0 : _c.onmessage) == null ? void 0 : _d.call(_c, data.message);
            break;
          }
          case "abortSignal": {
            const controller = this.abortControllers.get(data.nonce);
            if (controller) {
              controller.abort(data.reason);
              this.abortControllers.delete(data.nonce);
            }
            break;
          }
        }
      });
      this.commandHandlers = handlers;
      this.target = target;
      this.targetOrigin = targetOrigin;
      this._fetch = (...args) => fetch2(...args);
    }
    setTargetOrigin(targetOrigin) {
      this.targetOrigin = targetOrigin;
    }
    sendMessage(data, transfer) {
      var _a22;
      const message = {
        __xpaiChatKit: true,
        ...data
      };
      (_a22 = this.target()) == null ? void 0 : _a22.postMessage(message, this.targetOrigin, transfer);
    }
    connect() {
      window.addEventListener("message", this.handleMessage);
    }
    disconnect() {
      window.removeEventListener("message", this.handleMessage);
    }
    fetch(url, params) {
      return new Promise((resolve, reject) => {
        const nonce = crypto.randomUUID();
        this.handlers.set(nonce, { resolve, reject, stack: new Error().stack || "" });
        let formData;
        if (params.body instanceof FormData) {
          formData = {};
          for (const [key, value] of params.body.entries()) {
            formData[key] = value;
          }
          params.body = void 0;
        }
        if (params.signal) {
          params.signal.addEventListener("abort", () => {
            var _a22;
            this.sendMessage({
              type: "abortSignal",
              nonce,
              reason: (_a22 = params.signal) == null ? void 0 : _a22.reason
            });
          });
          params.signal = void 0;
        }
        this.sendMessage({ type: "fetch", nonce, params, formData, url });
      });
    }
    // Supporting onopen would require a good way for us to serialize the Response object
    // across the iframe boundary, which is not trivial and also not really necessary.
    fetchEventSource(url, params) {
      return new Promise((resolve, reject) => {
        const { onmessage, signal, ...rest } = params;
        const nonce = crypto.randomUUID();
        this.handlers.set(nonce, { resolve, reject, stack: new Error().stack || "" });
        this.fetchEventSourceHandlers.set(nonce, {
          onmessage
        });
        if (signal) {
          signal.addEventListener("abort", () => {
            this.sendMessage({
              type: "abortSignal",
              nonce,
              reason: signal.reason
            });
          });
        }
        this.sendMessage({ type: "fetchEventSource", nonce, params: rest, url });
      });
    }
    emit(...[event, data, transfer]) {
      this.sendMessage(
        {
          type: "event",
          event,
          data
        },
        transfer
      );
    }
    on(...[event, callback]) {
      this.emitter.on(event, callback);
    }
    destroy() {
      window.removeEventListener("message", this.handleMessage);
      this.emitter.allOff();
      this.handlers.clear();
    }
  }
  const toUrlBase64 = (bin) => btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const encodeBase64 = (value) => {
    if (value === void 0) {
      throw new TypeError(
        "encodeBase64: `undefined` cannot be encoded to valid JSON. Pass null instead."
      );
    }
    const json = JSON.stringify(value);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return toUrlBase64(bin);
  };
  class IntegrationError2 extends Error {
  }
  function fromPossibleFrameSafeError(err) {
    return err.message;
  }
  const BASE_CAPABILITY_ALLOWLIST = [
    // commands
    "command.setOptions",
    "command.sendUserMessage",
    "command.setComposerValue",
    "command.setThreadId",
    "command.focusComposer",
    "command.fetchUpdates",
    "command.sendCustomAction",
    "command.showHistory",
    "command.hideHistory",
    // events
    "event.ready",
    "event.error",
    "event.log",
    "event.response.start",
    "event.response.end",
    "event.response.stop",
    "event.thread.change",
    "event.tool.change",
    "event.thread.load.start",
    "event.thread.load.end",
    "event.deeplink",
    "event.effect",
    // errors
    "error.StreamError",
    "error.StreamEventParsingError",
    "error.WidgetItemError",
    "error.InitialThreadLoadError",
    "error.FileAttachmentError",
    "error.HistoryViewError",
    "error.FatalAppError",
    "error.IntegrationError",
    "error.EntitySearchError",
    "error.DomainVerificationRequestError",
    // backend
    "backend.threads.get_by_id",
    "backend.threads.list",
    "backend.threads.update",
    "backend.threads.delete",
    "backend.threads.create",
    "backend.threads.add_user_message",
    "backend.threads.add_client_tool_output",
    "backend.threads.retry_after_item",
    "backend.threads.custom_action",
    "backend.attachments.create",
    "backend.attachments.get_preview",
    "backend.attachments.delete",
    "backend.items.list",
    "backend.items.feedback",
    // thread item types
    "thread.item.generated_image",
    "thread.item.user_message",
    "thread.item.assistant_message",
    "thread.item.client_tool_call",
    "thread.item.widget",
    "thread.item.task",
    "thread.item.workflow",
    "thread.item.end_of_turn",
    "thread.item.image_generation",
    // widgets
    "widget.Basic",
    "widget.Card",
    "widget.ListView",
    "widget.ListViewItem",
    "widget.Badge",
    "widget.Box",
    "widget.Row",
    "widget.Col",
    "widget.Button",
    "widget.Caption",
    "widget.Chart",
    "widget.Checkbox",
    "widget.DatePicker",
    "widget.Divider",
    "widget.Form",
    "widget.Icon",
    "widget.Image",
    "widget.Input",
    "widget.Label",
    "widget.Markdown",
    "widget.RadioGroup",
    "widget.Select",
    "widget.Spacer",
    "widget.Text",
    "widget.Textarea",
    "widget.Title",
    "widget.Transition"
  ];
  const BASE_CAPABILITY_DENYLIST = [
    // --- commands
    "command.shareThread",
    "command.setTrainingOptOut",
    // --- events
    "event.thread.restore",
    "event.message.share",
    "event.image.download",
    "event.history.open",
    "event.history.close",
    "event.log.chatgpt",
    // --- errors
    // These errors considered internal and are not exposed to the user by default.
    "error.HttpError",
    "error.NetworkError",
    "error.UnhandledError",
    "error.UnhandledPromiseRejectionError",
    "error.StreamEventHandlingError",
    "error.StreamStopError",
    "error.ThreadRenderingError",
    "error.IntlError",
    "error.AppError",
    // --- backend
    "backend.threads.stop",
    "backend.threads.share",
    "backend.threads.create_from_shared",
    "backend.threads.init",
    "backend.attachments.process",
    // widgets
    "widget.CardCarousel",
    "widget.Favicon",
    "widget.CardLinkItem",
    "widget.Map"
  ];
  const PROFILE_TO_RULES = {
    "chatkit": {
      allow: [...BASE_CAPABILITY_ALLOWLIST, "thread.item.image_generation"],
      deny: BASE_CAPABILITY_DENYLIST
    }
  };
  const getCapabilities = (profile) => {
    const rules = PROFILE_TO_RULES[profile];
    const effective = new Set(rules.allow);
    for (const capability of rules.deny ?? []) {
      effective.delete(capability);
    }
    const commands = /* @__PURE__ */ new Set();
    const events = /* @__PURE__ */ new Set();
    const backend = /* @__PURE__ */ new Set();
    const threadItems = /* @__PURE__ */ new Set();
    const errors = /* @__PURE__ */ new Set();
    const widgets = /* @__PURE__ */ new Set();
    for (const capability of effective) {
      if (capability.startsWith("command.")) {
        commands.add(capability.slice("command.".length));
        continue;
      }
      if (capability.startsWith("event.")) {
        events.add(capability.slice("event.".length));
        continue;
      }
      if (capability.startsWith("backend.")) {
        backend.add(capability.slice("backend.".length));
        continue;
      }
      if (capability.startsWith("thread.item.")) {
        threadItems.add(capability.slice("thread.item.".length));
      }
      if (capability.startsWith("error.")) {
        errors.add(capability.slice("error.".length));
        continue;
      }
      if (capability.startsWith("widget.")) {
        widgets.add(capability.slice("widget.".length));
        continue;
      }
    }
    return { commands, events, backend, threadItems, errors, widgets };
  };
  class ChatFrameMessenger extends BaseMessenger {
    // Messenger running in outer can always handle commands coming from inner
    canReceiveCommand(_) {
      return true;
    }
  }
  const removeMethods = (obj, seen = /* @__PURE__ */ new WeakSet()) => {
    if (typeof obj === "function") return "[ChatKitMethod]";
    if (typeof obj !== "object" || obj === null) return obj;
    if (seen.has(obj)) return obj;
    seen.add(obj);
    if (Array.isArray(obj)) {
      return obj.map((c) => removeMethods(c, seen));
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value !== "function") {
        result[key] = removeMethods(value, seen);
      } else {
        result[key] = "[ChatKitMethod]";
      }
    }
    return result;
  };
  function getInnerOptions(options) {
    return removeMethods(options);
  }
  function requireCommandCapability(value, context) {
    const command = String(context.name);
    return function(...args) {
      if (!this.capabilities.commands.has(command)) {
        throw new IntegrationError2(
          `ChatKit command "${String(command)}" is not available for the "${this.profile}" profile.`
        );
      }
      return value.apply(this, args);
    };
  }
  class ChatKitElementBase extends (_a2 = HTMLElement, _focusComposer_dec = [requireCommandCapability], _fetchUpdates_dec = [requireCommandCapability], _sendUserMessage_dec = [requireCommandCapability], _setComposerValue_dec = [requireCommandCapability], _setThreadId_dec = [requireCommandCapability], _shareThread_dec = [requireCommandCapability], _sendCustomAction_dec = [requireCommandCapability], _showHistory_dec = [requireCommandCapability], _hideHistory_dec = [requireCommandCapability], _setTrainingOptOut_dec = [requireCommandCapability], _a2) {
    constructor({ profile }) {
      super();
      __runInitializers(_init, 5, this);
      __privateAdd(this, _ChatKitElementBase_instances);
      __privateAdd(this, _opts);
      __privateAdd(this, _frameUrl);
      __privateAdd(this, _frame);
      __privateAdd(this, _wrapper);
      __privateAdd(this, _shadow, this.attachShadow({ mode: "open" }));
      __privateAdd(this, _resolveLoaded);
      __privateAdd(this, _loaded, new Promise((resolve) => {
        __privateSet(this, _resolveLoaded, resolve);
      }));
      __privateAdd(this, _messenger, new ChatFrameMessenger({
        fetch: (...args) => {
          var _a3;
          const customFetch = ((_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.api) && "fetch" in __privateGet(this, _opts).api && __privateGet(this, _opts).api.fetch;
          return customFetch ? customFetch(...args) : fetch(...args);
        },
        target: () => {
          var _a3;
          return ((_a3 = __privateGet(this, _frame)) == null ? void 0 : _a3.contentWindow) ?? null;
        },
        targetOrigin: window.location.origin,
        handlers: {
          onFileInputClick: ({ inputAttributes }) => {
            return new Promise((resolve) => {
              const input = document.createElement("input");
              for (const [key, value] of Object.entries(inputAttributes)) {
                input.setAttribute(key, String(value));
              }
              const respond = () => {
                resolve(Array.from(input.files || []));
                if (__privateGet(this, _shadow).contains(input)) {
                  __privateGet(this, _shadow).removeChild(input);
                }
              };
              input.addEventListener("cancel", respond);
              input.addEventListener("change", respond);
              __privateGet(this, _shadow).appendChild(input);
              input.click();
            });
          },
          onClientToolCall: async ({
            name,
            params,
            id,
            tool_call_id
          }) => {
            var _a3;
            const onClientTool = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.onClientTool;
            if (!onClientTool) {
              __privateMethod(this, _ChatKitElementBase_instances, emitAndThrow_fn).call(this, new IntegrationError2(
                `No handler for client tool calls. You'll need to add onClientTool to your ChatKit options.`
              ));
            }
            return onClientTool({ name, params, id, tool_call_id });
          },
          onWidgetAction: async ({ action, widgetItem }) => {
            var _a3, _b2;
            const onAction = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.widgets) == null ? void 0 : _b2.onAction;
            if (!onAction) {
              __privateMethod(this, _ChatKitElementBase_instances, emitAndThrow_fn).call(this, new IntegrationError2(
                `No handler for widget actions. You'll need to add widgets.onAction to your ChatKit options.`
              ));
            }
            return onAction(action, widgetItem);
          },
          onEntitySearch: async ({ query }) => {
            var _a3, _b2, _c;
            return ((_c = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.entities) == null ? void 0 : _b2.onTagSearch) == null ? void 0 : _c.call(_b2, query)) ?? [];
          },
          onEntityClick: async ({ entity }) => {
            var _a3, _b2, _c;
            return (_c = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.entities) == null ? void 0 : _b2.onClick) == null ? void 0 : _c.call(_b2, entity);
          },
          onEntityPreview: async ({ entity }) => {
            var _a3, _b2, _c;
            return ((_c = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.entities) == null ? void 0 : _b2.onRequestPreview) == null ? void 0 : _c.call(_b2, entity)) ?? { preview: null };
          },
          onGetClientSecret: async (currentClientSecret) => {
            if (!__privateGet(this, _opts) || !("getClientSecret" in __privateGet(this, _opts).api) || !__privateGet(this, _opts).api.getClientSecret) {
              __privateMethod(this, _ChatKitElementBase_instances, emitAndThrow_fn).call(this, new IntegrationError2(
                "Could not refresh the session because ChatKitOptions.api.getClientSecret is not configured."
              ));
            }
            return __privateGet(this, _opts).api.getClientSecret(currentClientSecret ?? null);
          },
          onAddMetadataToRequest: ({
            op,
            params
          }) => {
            throw new IntegrationError2("ChatKit: onAddMetadataToRequest is unimplemented.");
          }
        }
      }));
      __privateAdd(this, _handleFrameLoad, () => {
        var _a3;
        this.dataset.loaded = "true";
        this.dispatchEvent(new CustomEvent("chatkit.ready", { bubbles: true, composed: true }));
        (_a3 = __privateGet(this, _resolveLoaded)) == null ? void 0 : _a3.call(this);
      });
      __privateAdd(this, _initialized, false);
      this.profile = profile;
      this.capabilities = getCapabilities(profile);
    }
    setProfile(profile) {
      this.profile = profile;
      this.capabilities = getCapabilities(profile);
    }
    connectedCallback() {
      const style = document.createElement("style");
      style.textContent = `
      :host {
        display: block;
        position: relative;
        height: 100%;
        width: 100%;
      }
      .ck-iframe {
        border: none;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        color-scheme: light only;
      }
      .ck-wrapper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        opacity: 0;
      }
      :host([data-color-scheme="dark"]) .ck-iframe {
        color-scheme: dark only;
      }
      :host([data-loaded="true"]) .ck-wrapper {
        opacity: 1;
      }
    `;
      const frame = document.createElement("iframe");
      frame.className = "ck-iframe";
      frame.name = "chatkit";
      frame.role = "presentation";
      frame.tabIndex = 0;
      frame.setAttribute("allowtransparency", "true");
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("scrolling", "no");
      frame.setAttribute("allow", "clipboard-read; clipboard-write");
      __privateSet(this, _frame, frame);
      const wrapper = document.createElement("div");
      wrapper.className = "ck-wrapper";
      wrapper.appendChild(frame);
      __privateSet(this, _wrapper, wrapper);
      __privateGet(this, _shadow).append(style);
      __privateGet(this, _messenger).on("left_header_icon_click", () => {
        var _a3, _b2, _c;
        (_c = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.header) == null ? void 0 : _b2.leftAction) == null ? void 0 : _c.onClick();
      });
      __privateGet(this, _messenger).on("right_header_icon_click", () => {
        var _a3, _b2, _c;
        (_c = (_b2 = (_a3 = __privateGet(this, _opts)) == null ? void 0 : _a3.header) == null ? void 0 : _b2.rightAction) == null ? void 0 : _c.onClick();
      });
      __privateGet(this, _messenger).on("public_event", ([event, data]) => {
        if (!this.capabilities.events.has(event)) return;
        if (event === "error" && "error" in data) {
          const error = fromPossibleFrameSafeError(data.error);
          this.dispatchEvent(new CustomEvent("chatkit.error", { detail: { error } }));
          if (error instanceof IntegrationError2) {
            throw error;
          }
          return;
        }
        this.dispatchEvent(new CustomEvent(`chatkit.${event}`, { detail: data }));
      });
      __privateGet(this, _messenger).on("unmount", () => {
        if (__privateGet(this, _wrapper) && __privateGet(this, _shadow).contains(__privateGet(this, _wrapper))) {
          __privateGet(this, _shadow).removeChild(__privateGet(this, _wrapper));
          __privateSet(this, _wrapper, void 0);
          __privateSet(this, _frame, void 0);
        }
      });
      __privateGet(this, _messenger).on(
        "capabilities_profile_change",
        ({ profile }) => {
          this.setProfile(profile);
        }
      );
      frame.addEventListener("load", __privateGet(this, _handleFrameLoad), { once: true });
      try {
        __privateMethod(this, _ChatKitElementBase_instances, maybeInit_fn).call(this);
      } catch (error) {
        console.error(error);
        __privateMethod(this, _ChatKitElementBase_instances, emitAndThrow_fn).call(this, error instanceof Error ? error : new IntegrationError2("Failed to initialize ChatKit"));
      }
    }
    disconnectedCallback() {
      var _a3;
      (_a3 = __privateGet(this, _frame)) == null ? void 0 : _a3.removeEventListener("load", __privateGet(this, _handleFrameLoad));
      __privateGet(this, _messenger).disconnect();
    }
    applySanitizedOptions(newOptions) {
      __privateSet(this, _opts, newOptions);
      if (__privateGet(this, _initialized)) {
        __privateMethod(this, _ChatKitElementBase_instances, setOptionsDataAttributes_fn).call(this, __privateGet(this, _opts));
        __privateGet(this, _loaded).then(() => {
          __privateGet(this, _messenger).commands.setOptions(getInnerOptions(newOptions));
        });
      } else {
        __privateMethod(this, _ChatKitElementBase_instances, maybeInit_fn).call(this);
      }
    }
    setOptions(newOptions) {
      try {
        const sanitized = this.sanitizeOptions(newOptions);
        __privateMethod(this, _ChatKitElementBase_instances, consumeFrameUrl_fn).call(this, sanitized);
        this.applySanitizedOptions(sanitized);
      } catch (error) {
        __privateMethod(this, _ChatKitElementBase_instances, emitAndThrow_fn).call(this, error instanceof Error ? error : new IntegrationError2("Failed to parse options"));
      }
    }
    async focusComposer() {
      var _a3, _b2;
      await __privateGet(this, _loaded);
      (_a3 = __privateGet(this, _frame)) == null ? void 0 : _a3.focus();
      await ((_b2 = __privateGet(this, _messenger)) == null ? void 0 : _b2.commands.focusComposer());
    }
    async fetchUpdates() {
      var _a3;
      await __privateGet(this, _loaded);
      await ((_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.fetchUpdates());
    }
    async sendUserMessage(params) {
      var _a3;
      await __privateGet(this, _loaded);
      await ((_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.sendUserMessage(params));
    }
    async setComposerValue(params) {
      var _a3;
      await __privateGet(this, _loaded);
      await ((_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.setComposerValue(params));
    }
    async setThreadId(threadId) {
      var _a3;
      await __privateGet(this, _loaded);
      await ((_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.setThreadId({ threadId }));
    }
    async shareThread() {
      var _a3;
      await __privateGet(this, _loaded);
      return (_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.shareThread();
    }
    async sendCustomAction(action, itemId) {
      var _a3;
      await __privateGet(this, _loaded);
      return (_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.sendCustomAction({ action, itemId });
    }
    async showHistory() {
      var _a3;
      await __privateGet(this, _loaded);
      return (_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.showHistory();
    }
    async hideHistory() {
      var _a3;
      await __privateGet(this, _loaded);
      return (_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.hideHistory();
    }
    async setTrainingOptOut(value) {
      var _a3;
      await __privateGet(this, _loaded);
      return (_a3 = __privateGet(this, _messenger)) == null ? void 0 : _a3.commands.setTrainingOptOut({ value });
    }
  }
  _init = __decoratorStart(_a2);
  _opts = /* @__PURE__ */ new WeakMap();
  _frameUrl = /* @__PURE__ */ new WeakMap();
  _frame = /* @__PURE__ */ new WeakMap();
  _wrapper = /* @__PURE__ */ new WeakMap();
  _shadow = /* @__PURE__ */ new WeakMap();
  _resolveLoaded = /* @__PURE__ */ new WeakMap();
  _loaded = /* @__PURE__ */ new WeakMap();
  _messenger = /* @__PURE__ */ new WeakMap();
  _ChatKitElementBase_instances = /* @__PURE__ */ new WeakSet();
  emitAndThrow_fn = function(error) {
    this.dispatchEvent(new CustomEvent("chatkit.error", { detail: { error } }));
    throw error;
  };
  setOptionsDataAttributes_fn = function(options) {
    var _a3;
    this.dataset.colorScheme = typeof options.theme === "string" ? options.theme : ((_a3 = options.theme) == null ? void 0 : _a3.colorScheme) ?? "light";
  };
  getFrameUrl_fn = function() {
    if (!__privateGet(this, _frameUrl)) {
      throw new IntegrationError2(
        "ChatKit frameUrl is not configured. Provide it via setOptions({ frameUrl }) before mounting."
      );
    }
    return __privateGet(this, _frameUrl);
  };
  setFrameUrl_fn = function(frameUrl) {
    if (__privateGet(this, _initialized) && __privateGet(this, _frameUrl) && __privateGet(this, _frameUrl) !== frameUrl) {
      throw new IntegrationError2(
        "ChatKit frameUrl cannot be changed after initialization. Create a new element to use a different URL."
      );
    }
    __privateSet(this, _frameUrl, frameUrl);
  };
  consumeFrameUrl_fn = function(options) {
    if (!("frameUrl" in options)) return;
    const frameUrl = options.frameUrl;
    delete options.frameUrl;
    if (frameUrl == null) return;
    if (typeof frameUrl !== "string" || frameUrl.trim() === "") {
      throw new IntegrationError2("ChatKit frameUrl must be a non-empty string.");
    }
    __privateMethod(this, _ChatKitElementBase_instances, setFrameUrl_fn).call(this, frameUrl);
  };
  _handleFrameLoad = /* @__PURE__ */ new WeakMap();
  _initialized = /* @__PURE__ */ new WeakMap();
  maybeInit_fn = function() {
    if (__privateGet(this, _initialized) || !__privateGet(this, _frame) || !__privateGet(this, _opts)) {
      return;
    }
    __privateSet(this, _initialized, true);
    __privateMethod(this, _ChatKitElementBase_instances, setOptionsDataAttributes_fn).call(this, __privateGet(this, _opts));
    const frameURL = new URL(__privateMethod(this, _ChatKitElementBase_instances, getFrameUrl_fn).call(this), window.location.origin);
    __privateGet(this, _messenger).setTargetOrigin(frameURL.origin);
    frameURL.hash = encodeBase64({
      options: getInnerOptions(__privateGet(this, _opts)),
      referrer: window.location.origin,
      profile: this.profile
    });
    __privateGet(this, _messenger).connect();
    __privateGet(this, _frame).src = frameURL.toString();
    if (__privateGet(this, _wrapper)) {
      __privateGet(this, _shadow).append(__privateGet(this, _wrapper));
    }
  };
  __decorateElement(_init, 1, "focusComposer", _focusComposer_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "fetchUpdates", _fetchUpdates_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "sendUserMessage", _sendUserMessage_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "setComposerValue", _setComposerValue_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "setThreadId", _setThreadId_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "shareThread", _shareThread_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "sendCustomAction", _sendCustomAction_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "showHistory", _showHistory_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "hideHistory", _hideHistory_dec, ChatKitElementBase);
  __decorateElement(_init, 1, "setTrainingOptOut", _setTrainingOptOut_dec, ChatKitElementBase);
  __decoratorMetadata(_init, ChatKitElementBase);
  class ChatKitElement extends ChatKitElementBase {
    constructor() {
      super({ profile: "chatkit" });
    }
    sanitizeOptions(options) {
      var _a3;
      (_a3 = options.threadItemActions) == null ? true : delete _a3.share;
      return options;
    }
  }
  function registerChatKitElement(tag = "xpertai-chatkit") {
    if (!("customElements" in globalThis)) return;
    if (!customElements.get(tag)) {
      customElements.define(tag, ChatKitElement);
    }
  }
  registerChatKitElement();
  const EXCLUDED_HANDLER_KEYS = /* @__PURE__ */ new Set(["onClientTool"]);
  const EVENT_HANDLER_MAP = {
    "chatkit.error": "onError",
    "chatkit.response.end": "onResponseEnd",
    "chatkit.response.start": "onResponseStart",
    "chatkit.log": "onLog",
    "chatkit.thread.change": "onThreadChange",
    "chatkit.thread.load.start": "onThreadLoadStart",
    "chatkit.thread.load.end": "onThreadLoadEnd",
    "chatkit.ready": "onReady",
    "chatkit.effect": "onEffect"
  };
  const UI5_EVENT_NAME_MAP = {
    "chatkit.error": "error",
    "chatkit.response.end": "responseEnd",
    "chatkit.response.start": "responseStart",
    "chatkit.log": "log",
    "chatkit.thread.change": "threadChange",
    "chatkit.thread.load.start": "threadLoadStart",
    "chatkit.thread.load.end": "threadLoadEnd",
    "chatkit.ready": "ready",
    "chatkit.effect": "effect"
  };
  const EVENT_NAMES = Object.keys(EVENT_HANDLER_MAP);
  function splitOptions(value) {
    const options = {};
    const handlers = {};
    if (!value) {
      return { options, handlers };
    }
    for (const [key, entry] of Object.entries(value)) {
      if (/^on[A-Z]/.test(key) && !EXCLUDED_HANDLER_KEYS.has(key)) {
        const handlerKey = key;
        if (typeof entry === "function") {
          Object.assign(handlers, { [handlerKey]: entry });
        }
      } else {
        options[key] = entry;
      }
    }
    return { options, handlers };
  }
  function applyOptions(el, options, isCurrent) {
    if (typeof customElements === "undefined") {
      if (typeof el.setOptions === "function") {
        el.setOptions(options);
      }
      return void 0;
    }
    if (customElements.get("xpertai-chatkit")) {
      el.setOptions(options);
      return void 0;
    }
    let active = true;
    customElements.whenDefined("xpertai-chatkit").then(() => {
      if (active && isCurrent()) {
        el.setOptions(options);
      }
    });
    return () => {
      active = false;
    };
  }
  function getControlBase() {
    var _a3, _b2;
    if ((_b2 = (_a3 = sap == null ? void 0 : sap.ui) == null ? void 0 : _a3.core) == null ? void 0 : _b2.Control) {
      return sap.ui.core.Control;
    }
    throw new Error("sap.ui.core.Control is required for @xpert-ai/chatkit-ui5");
  }
  const ControlBase = getControlBase();
  const ChatKit = ControlBase.extend("xpertai.chatkit.ui5.ChatKit", {
    metadata: {
      properties: {
        config: { type: "object", defaultValue: {} }
      },
      events: {
        error: { parameters: { detail: { type: "object" } } },
        responseEnd: { parameters: { detail: { type: "object" } } },
        responseStart: { parameters: { detail: { type: "object" } } },
        log: { parameters: { detail: { type: "object" } } },
        threadChange: { parameters: { detail: { type: "object" } } },
        threadLoadStart: { parameters: { detail: { type: "object" } } },
        threadLoadEnd: { parameters: { detail: { type: "object" } } },
        ready: { parameters: { detail: { type: "object" } } },
        effect: { parameters: { detail: { type: "object" } } }
      }
    },
    renderer: {
      apiVersion: 2,
      render(oRm, oControl) {
        oRm.openStart("xpertai-chatkit", oControl);
        oRm.openEnd();
        oRm.close("xpertai-chatkit");
      }
    },
    init() {
      this._chatkitEl = null;
      this._optionsCleanup = void 0;
      this._eventsAbortController = null;
      const config = typeof this.getProperty === "function" ? this.getProperty("config") : {};
      this._setConfig(config ?? {});
    },
    setConfig(value) {
      if (typeof this.setProperty === "function") {
        this.setProperty("config", value ?? {}, true);
      }
      this._setConfig(value ?? {});
      return this;
    },
    onAfterRendering() {
      this._chatkitEl = typeof this.getDomRef === "function" ? this.getDomRef() : null;
      this._applyOptions();
      this._bindHandlers();
    },
    exit() {
      this._teardown();
    },
    _teardown() {
      if (this._optionsCleanup) {
        this._optionsCleanup();
        this._optionsCleanup = void 0;
      }
      if (this._eventsAbortController) {
        this._eventsAbortController.abort();
        this._eventsAbortController = null;
      }
      this._chatkitEl = null;
    },
    _setConfig(value) {
      const next = splitOptions(value);
      this._options = next.options;
      this._handlers = next.handlers;
      this._applyOptions();
      this._bindHandlers();
    },
    _applyOptions() {
      if (this._optionsCleanup) {
        this._optionsCleanup();
        this._optionsCleanup = void 0;
      }
      const el = this._chatkitEl;
      if (!el) return;
      this._optionsCleanup = applyOptions(
        el,
        this._options,
        () => typeof this.getDomRef === "function" && this.getDomRef() === el
      );
    },
    _bindHandlers() {
      if (this._eventsAbortController) {
        this._eventsAbortController.abort();
        this._eventsAbortController = null;
      }
      const el = this._chatkitEl;
      if (!el) return;
      const controller = new AbortController();
      for (const eventName of EVENT_NAMES) {
        el.addEventListener(
          eventName,
          (e) => {
            var _a3;
            const detail = e.detail;
            const handlerName = EVENT_HANDLER_MAP[eventName];
            const handler = (_a3 = this._handlers) == null ? void 0 : _a3[handlerName];
            if (typeof handler === "function") {
              handler(detail);
            }
            if (typeof this.fireEvent === "function") {
              this.fireEvent(UI5_EVENT_NAME_MAP[eventName], { detail });
            }
          },
          { signal: controller.signal }
        );
      }
      this._eventsAbortController = controller;
    },
    _callMethod(method, ...args) {
      const el = this._chatkitEl;
      const methodRef = el == null ? void 0 : el[method];
      if (!el || typeof methodRef !== "function") {
        if (typeof console !== "undefined" && typeof console.warn === "function") {
          console.warn("ChatKit element is not mounted");
        }
        return;
      }
      return methodRef.apply(el, args);
    },
    focusComposer(...args) {
      return this._callMethod("focusComposer", ...args);
    },
    setThreadId(...args) {
      return this._callMethod("setThreadId", ...args);
    },
    sendUserMessage(...args) {
      return this._callMethod("sendUserMessage", ...args);
    },
    setComposerValue(...args) {
      return this._callMethod("setComposerValue", ...args);
    },
    fetchUpdates(...args) {
      return this._callMethod("fetchUpdates", ...args);
    },
    sendCustomAction(...args) {
      return this._callMethod("sendCustomAction", ...args);
    }
  });
  exports2.ChatKit = ChatKit;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=chatkit.ui5.js.map
