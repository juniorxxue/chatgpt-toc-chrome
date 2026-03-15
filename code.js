const CONSTANTS = {
  SELECTORS: {
    MAIN: "main",
    USER_MESSAGE: 'div[data-message-author-role="user"]',
    ASSISTANT_MESSAGE: 'div[data-message-author-role="assistant"]',
    HEADING_ELEMENTS: "h1, h2, h3, h4, h5, h6",
    SEND_BUTTON: '[data-testid="send-button"]',
    PROMPT_TEXTAREA: "#prompt-textarea",
  },
  IDS: {
    TOC_CONTAINER: "chatgpt-toc-extension",
    TOC_CONTENT: "chatgpt-toc-content",
    TOC_PIN_BTN: "toc-pin-btn",
    TOC_SEARCH_TOGGLE_BTN: "toc-search-toggle-btn",
    TOC_TOGGLE_BTN: "toc-toggle-btn",
    SEARCH_INPUT: "toc-search-input",
    SEARCH_CLEAR: "toc-search-clear",
  },
  CLASSES: {
    TOC_HEADER: "toc-header",
    TOC_HEADER_CONTENT: "toc-header-content",
    TOC_SEARCH_CONTAINER: "toc-search-container",
    TOC_CONTENT: "toc-content",
    COLLAPSED: "collapsed",
    TARGET_HIGHLIGHT: "toc-highlight-target",
  },
  DELAYS: {
    PAGE_LOAD: 1500,
    DOM_SETTLE: 300,
    HEARTBEAT: 5000,
    PROMPT_SUBMISSION: 150,
    ENTER_KEY: 120,
    HOVER_COLLAPSE: 180,
    HIGHLIGHT: 1800,
  },
  CONSTRAINTS: {
    PADDING: 10,
    COLLAPSE_BREAKPOINT: 1024,
  },
  STORAGE_KEY_POSITION: "chatgpt-toc-position",
  STORAGE_KEY_CUSTOM_NAMES: "chatgpt-toc-custom-names",
  STORAGE_KEY_PINNED: "chatgpt-toc-pinned",
};

const ICONS = {
  TOGGLE: `
    <svg class="toc-icon-minimize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="toc-icon-maximize" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  CHEVRON_DOWN: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  CHEVRON_RIGHT: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  EDIT: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  `,
  PIN: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 4.5L19.5 9l-3 1.5v4.5l-1.5 1.5-3-4.5-3 3-.75-.75 3-3-4.5-3L8.25 6h4.5L15 4.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  SEARCH: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/>
      <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  PLUS: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  MINUS: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
};

class CustomNameManager {
  static saveName(chatId, originalText, newName) {
    if (!chatId || !originalText) return;

    const allNames = this.getAllNames();
    if (!allNames[chatId]) {
      allNames[chatId] = {};
    }

    const key = this.generateKey(originalText);
    if (!newName) {
      delete allNames[chatId][key];
    } else {
      allNames[chatId][key] = newName.trim();
    }

    localStorage.setItem(
      CONSTANTS.STORAGE_KEY_CUSTOM_NAMES,
      JSON.stringify(allNames),
    );
  }

  static getName(chatId, originalText) {
    if (!chatId || !originalText) return null;

    const allNames = this.getAllNames();
    return allNames[chatId]?.[this.generateKey(originalText)] || null;
  }

  static getAllNames() {
    const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY_CUSTOM_NAMES);

    try {
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Unable to parse stored TOC names.", error);
      return {};
    }
  }

  static generateKey(text) {
    return text.trim().slice(0, 200);
  }
}

class PositionManager {
  static savePosition(x, y) {
    localStorage.setItem(
      CONSTANTS.STORAGE_KEY_POSITION,
      JSON.stringify({ x, y }),
    );
  }

  static getSavedPosition() {
    const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY_POSITION);

    try {
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Unable to parse stored TOC position.", error);
      return null;
    }
  }

  static applyPosition(element, x, y) {
    const styles = {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      right: "auto",
      bottom: "auto",
      margin: "0",
      transform: "none",
    };

    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value, "important");
    });
  }

  static constrainToViewport(x, y, width, height) {
    const padding = CONSTANTS.CONSTRAINTS.PADDING;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const maxY = Math.max(padding, window.innerHeight - height - padding);

    return {
      x: Math.max(padding, Math.min(x, maxX)),
      y: Math.max(padding, Math.min(y, maxY)),
    };
  }
}

class DragManager {
  constructor(element, positionManager, options = {}) {
    this.element = element;
    this.positionManager = positionManager;
    this.onCollapseChange = options.onCollapseChange || null;
    this.onDragEnd = options.onDragEnd || null;
    this.onToggleButtonPress = options.onToggleButtonPress || null;
    this.isDragging = false;
    this.hasMoved = false;
    this.isClickOnToggle = false;
    this.startMouseX = 0;
    this.startMouseY = 0;
    this.startElementX = 0;
    this.startElementY = 0;

    this.boundDrag = this.drag.bind(this);
    this.boundStopDrag = this.stopDrag.bind(this);

    this.init();
  }

  init() {
    this.element.addEventListener("mousedown", this.startDrag.bind(this));

    const header = this.element.querySelector(`.${CONSTANTS.CLASSES.TOC_HEADER}`);
    if (header) {
      header.style.cursor = "grab";
    }
  }

  startDrag(event) {
    const isToggleButton = event.target.closest(`#${CONSTANTS.IDS.TOC_TOGGLE_BTN}`);
    const isInteractive = event.target.closest(
      "input, button, a, textarea, [contenteditable='true']",
    );
    const isCollapsed = this.element.classList.contains(
      CONSTANTS.CLASSES.COLLAPSED,
    );

    if (isInteractive && !isToggleButton) {
      return;
    }

    if (isToggleButton) {
      const shouldContinue = this.onToggleButtonPress?.(isCollapsed);
      if (shouldContinue === false) {
        return;
      }

      if (!isCollapsed) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleCollapse(false);
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.hasMoved = false;
    this.isClickOnToggle = Boolean(isToggleButton);
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;

    const rect = this.element.getBoundingClientRect();
    this.startElementX = rect.left;
    this.startElementY = rect.top;

    this.positionManager.applyPosition(
      this.element,
      this.startElementX,
      this.startElementY,
    );
    this.applyDragStyles();

    document.addEventListener("mousemove", this.boundDrag);
    document.addEventListener("mouseup", this.boundStopDrag);
    document.body.style.userSelect = "none";
  }

  drag(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - this.startMouseX;
    const deltaY = event.clientY - this.startMouseY;

    if (!this.hasMoved && Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) {
      return;
    }

    this.hasMoved = true;

    const newX = this.startElementX + deltaX;
    const newY = this.startElementY + deltaY;
    const constrained = this.positionManager.constrainToViewport(
      newX,
      newY,
      this.element.offsetWidth,
      this.element.offsetHeight,
    );

    this.positionManager.applyPosition(
      this.element,
      constrained.x,
      constrained.y,
    );
  }

  stopDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;

    const rect = this.element.getBoundingClientRect();
    this.positionManager.savePosition(rect.left, rect.top);

    if (!this.hasMoved && this.isClickOnToggle) {
      const shouldContinue = this.onToggleButtonPress?.(true);
      if (shouldContinue === false) {
        this.removeDragStyles();
        document.removeEventListener("mousemove", this.boundDrag);
        document.removeEventListener("mouseup", this.boundStopDrag);
        document.body.style.userSelect = "";
        return;
      }

      this.toggleCollapse(true);
    }

    this.removeDragStyles();
    document.removeEventListener("mousemove", this.boundDrag);
    document.removeEventListener("mouseup", this.boundStopDrag);
    document.body.style.userSelect = "";
    this.onDragEnd?.();
  }

  toggleCollapse(isExpanding) {
    const rect = this.element.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;
    const toggleButton = this.element.querySelector(
      `#${CONSTANTS.IDS.TOC_TOGGLE_BTN}`,
    );

    if (!toggleButton) return;

    if (!isExpanding) {
      const buttonRect = toggleButton.getBoundingClientRect();

      this.element.dataset.expandedWidth = String(rect.width);
      this.element.dataset.offsetX = String(buttonRect.left - rect.left);
      this.element.dataset.offsetY = String(buttonRect.top - rect.top);

      this.element.classList.add(CONSTANTS.CLASSES.COLLAPSED);
      this.positionManager.applyPosition(
        this.element,
        buttonRect.left,
        buttonRect.top,
      );
      this.positionManager.savePosition(buttonRect.left, buttonRect.top);
      this.onCollapseChange?.(true);
      return;
    }

    const expandedWidth = parseFloat(this.element.dataset.expandedWidth) || 340;
    const offsetX =
      parseFloat(this.element.dataset.offsetX) || (expandedWidth - 32 - 25);
    const offsetY = parseFloat(this.element.dataset.offsetY) || 18;

    this.element.classList.remove(CONSTANTS.CLASSES.COLLAPSED);

    const constrained = this.positionManager.constrainToViewport(
      currentX - offsetX,
      currentY - offsetY,
      expandedWidth,
      this.element.offsetHeight,
    );

    this.positionManager.applyPosition(
      this.element,
      constrained.x,
      constrained.y,
    );
    this.positionManager.savePosition(constrained.x, constrained.y);
    this.onCollapseChange?.(false);
  }

  applyDragStyles() {
    this.element.style.opacity = "0.82";
    this.element.style.transition = "none";
    this.element.style.zIndex = "10001";
  }

  removeDragStyles() {
    this.element.style.opacity = "";
    this.element.style.transition = "";
    this.element.style.zIndex = "10000";
  }
}

class DOMManager {
  static createTOCContainer() {
    const container = document.createElement("aside");
    container.id = CONSTANTS.IDS.TOC_CONTAINER;
    container.setAttribute("aria-label", "ChatGPT answer table of contents");
    container.setAttribute("role", "complementary");
    return container;
  }

  static createHeader() {
    const header = document.createElement("div");
    header.className = CONSTANTS.CLASSES.TOC_HEADER;

    const headerContent = document.createElement("div");
    headerContent.className = CONSTANTS.CLASSES.TOC_HEADER_CONTENT;

    const title = document.createElement("h2");
    title.textContent = "TOC";

    const headerActions = document.createElement("div");
    headerActions.className = "toc-header-actions";

    const searchButton = DOMManager.createActionButton(
      "toc-icon-button toc-search-toggle-btn",
      "Toggle search",
      ICONS.SEARCH,
    );
    searchButton.id = CONSTANTS.IDS.TOC_SEARCH_TOGGLE_BTN;
    searchButton.dataset.action = "toggle-search";

    const expandAllButton = DOMManager.createActionButton(
      "toc-icon-button toc-bulk-button",
      "Expand all prompts and headings",
      ICONS.PLUS,
    );
    expandAllButton.dataset.action = "expand-all";

    const collapseAllButton = DOMManager.createActionButton(
      "toc-icon-button toc-bulk-button",
      "Collapse all prompts",
      ICONS.MINUS,
    );
    collapseAllButton.dataset.action = "collapse-all";

    const pinButton = DOMManager.createActionButton(
      "toc-icon-button toc-pin-btn",
      "Pin open panel",
      ICONS.PIN,
    );
    pinButton.id = CONSTANTS.IDS.TOC_PIN_BTN;
    pinButton.dataset.action = "toggle-pin";

    const toggleButton = document.createElement("button");
    toggleButton.id = CONSTANTS.IDS.TOC_TOGGLE_BTN;
    toggleButton.type = "button";
    toggleButton.title = "Collapse table of contents";
    toggleButton.setAttribute("aria-label", "Collapse table of contents");
    toggleButton.innerHTML = ICONS.TOGGLE;

    headerContent.appendChild(title);
    headerActions.appendChild(searchButton);
    headerActions.appendChild(expandAllButton);
    headerActions.appendChild(collapseAllButton);
    headerActions.appendChild(pinButton);
    headerActions.appendChild(toggleButton);
    header.appendChild(headerContent);
    header.appendChild(headerActions);

    return header;
  }

  static createSearchContainer() {
    const container = document.createElement("div");
    container.className = CONSTANTS.CLASSES.TOC_SEARCH_CONTAINER;

    const input = document.createElement("input");
    input.type = "text";
    input.id = CONSTANTS.IDS.SEARCH_INPUT;
    input.placeholder = "Search...";
    input.autocomplete = "off";

    const clearButton = document.createElement("button");
    clearButton.id = CONSTANTS.IDS.SEARCH_CLEAR;
    clearButton.type = "button";
    clearButton.title = "Clear search";
    clearButton.setAttribute("aria-label", "Clear search");
    clearButton.textContent = "×";

    container.appendChild(input);
    container.appendChild(clearButton);

    return container;
  }

  static createContentContainer() {
    const content = document.createElement("div");
    content.id = CONSTANTS.IDS.TOC_CONTENT;
    content.className = CONSTANTS.CLASSES.TOC_CONTENT;
    return content;
  }

  static createActionButton(className, title, iconMarkup) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.innerHTML = iconMarkup;
    return button;
  }

  static createStateMessage(title, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "toc-state";

    const heading = document.createElement("strong");
    heading.textContent = title;

    const body = document.createElement("span");
    body.textContent = text;

    wrapper.appendChild(heading);
    wrapper.appendChild(body);

    return wrapper;
  }
}

class ConversationExtractor {
  static extractConversation() {
    const messageElements = this.getOrderedMessageElements();
    const groups = [];
    let currentGroup = null;
    let promptCount = 0;

    messageElements.forEach((messageElement) => {
      const role = messageElement.getAttribute("data-message-author-role");
      if (role === "user") {
        promptCount += 1;
        currentGroup = {
          index: groups.length,
          promptNumber: promptCount,
          promptElement: messageElement,
          messageElement: null,
          promptText:
            this.normalizeText(messageElement.textContent || "") ||
            `Prompt ${promptCount}`,
          headings: [],
          headingTree: [],
        };
        groups.push(currentGroup);
        return;
      }

      if (role !== "assistant") {
        return;
      }

      const headings = this.extractHeadings(messageElement);
      if (!currentGroup) {
        currentGroup = {
          index: groups.length,
          promptNumber: promptCount + 1,
          promptElement: null,
          messageElement,
          promptText: `Prompt ${promptCount + 1}`,
          headings,
          headingTree: this.buildHeadingTree(headings),
        };
        groups.push(currentGroup);
        return;
      }

      if (!currentGroup.messageElement) {
        currentGroup.messageElement = messageElement;
        currentGroup.headings = headings;
        currentGroup.headingTree = this.buildHeadingTree(headings);
        return;
      }

      currentGroup.headings = this.mergeHeadings(currentGroup.headings, headings);
      currentGroup.headingTree = this.buildHeadingTree(currentGroup.headings);
    });

    const normalizedGroups = groups.map((group, index) => ({
      ...group,
      index,
      promptNumber: group.promptNumber || index + 1,
    }));

    const signature = JSON.stringify(
      normalizedGroups.map((group) => ({
        promptNumber: group.promptNumber,
        prompt: group.promptText,
        hasPrompt: Boolean(group.promptElement),
        hasMessage: Boolean(group.messageElement),
        headings: group.headings.map((heading) => ({
          level: heading.level,
          text: heading.text,
        })),
      })),
    );

    return { groups: normalizedGroups, signature };
  }

  static getOrderedMessageElements() {
    const main = document.querySelector(CONSTANTS.SELECTORS.MAIN) || document;

    return Array.from(main.querySelectorAll("[data-message-author-role]")).filter(
      (element) => {
        const role = element.getAttribute("data-message-author-role");
        if (role !== "user" && role !== "assistant") {
          return false;
        }

        return !element.parentElement?.closest("[data-message-author-role]");
      },
    );
  }

  static extractHeadings(messageElement) {
    return Array.from(
      messageElement.querySelectorAll(CONSTANTS.SELECTORS.HEADING_ELEMENTS),
    )
      .map((element, index) => ({
        index,
        level: Number(element.tagName.slice(1)) || 2,
        text: this.normalizeText(element.textContent),
        element,
      }))
      .filter((heading) => heading.text);
  }

  static mergeHeadings(currentHeadings, nextHeadings) {
    return [...currentHeadings, ...nextHeadings].map((heading, index) => ({
      ...heading,
      index,
    }));
  }

  static buildHeadingTree(headings) {
    const tree = [];
    const stack = [];

    headings.forEach((heading) => {
      const node = {
        ...heading,
        children: [],
      };

      while (
        stack.length > 0 &&
        stack[stack.length - 1].level >= node.level
      ) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node);
      } else {
        tree.push(node);
      }

      stack.push(node);
    });

    return tree;
  }

  static normalizeText(text) {
    return text.replace(/\s+/g, " ").trim();
  }
}

class TOCExtension {
  constructor() {
    this.container = null;
    this.searchContainer = null;
    this.contentContainer = null;
    this.searchInput = null;
    this.searchClear = null;
    this.dragManager = null;
    this.groups = [];
    this.searchTerm = "";
    this.lastDataSignature = "";
    this.lastChatId = null;
    this.lastUrl = window.location.href;
    this.refreshTimer = null;
    this.autoCollapseTimer = null;
    this.highlightTimer = null;
    this.highlightedElement = null;
    this.collapsedGroups = new Set();
    this.collapsedHeadings = new Set();
    this.expandedHeadings = new Set();
    this.editingGroupIndex = null;
    this.focusEditOnRender = false;
    this.isPinned = this.getPinnedState();
    this.isSearchOpen = false;

    this.boundHandleSearchInput = this.handleSearchInput.bind(this);
    this.boundClearSearch = this.clearSearch.bind(this);
    this.boundHandleContentClick = this.handleContentClick.bind(this);
    this.boundHandleMouseEnter = this.handleMouseEnter.bind(this);
    this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.observeContentChanges();
    this.startHeartbeat();
    this.scheduleRefresh(CONSTANTS.DELAYS.PAGE_LOAD);
  }

  setupEventListeners() {
    window.addEventListener("load", () =>
      this.scheduleRefresh(CONSTANTS.DELAYS.PAGE_LOAD),
    );
    window.addEventListener("pageshow", () =>
      this.scheduleRefresh(CONSTANTS.DELAYS.DOM_SETTLE),
    );
    window.addEventListener("resize", this.handleWindowResize.bind(this));

    document.addEventListener(
      "click",
      this.handleDocumentClick.bind(this),
      true,
    );
    document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
  }

  observeContentChanges() {
    if (!document.body) return;

    const observer = new MutationObserver((mutations) => {
      const hasRelevantMutation = mutations.some(
        (mutation) => !this.shouldIgnoreMutation(mutation),
      );

      if (hasRelevantMutation) {
        this.scheduleRefresh(CONSTANTS.DELAYS.DOM_SETTLE);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.observer = observer;
  }

  shouldIgnoreMutation(mutation) {
    if (this.isInsideTOC(mutation.target)) {
      return true;
    }

    const changedNodes = [
      ...Array.from(mutation.addedNodes || []),
      ...Array.from(mutation.removedNodes || []),
    ];

    return (
      changedNodes.length > 0 &&
      changedNodes.every((node) => this.isInsideTOC(node))
    );
  }

  isInsideTOC(node) {
    if (!node) return false;

    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(
        node.parentElement?.closest(`#${CONSTANTS.IDS.TOC_CONTAINER}`),
      );
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    return (
      node.id === CONSTANTS.IDS.TOC_CONTAINER ||
      Boolean(node.closest(`#${CONSTANTS.IDS.TOC_CONTAINER}`))
    );
  }

  startHeartbeat() {
    window.setInterval(() => {
      if (window.location.href !== this.lastUrl) {
        this.lastUrl = window.location.href;
        this.lastDataSignature = "";
        this.scheduleRefresh(CONSTANTS.DELAYS.DOM_SETTLE);
        return;
      }

      this.refreshFromDOM(true);
    }, CONSTANTS.DELAYS.HEARTBEAT);
  }

  scheduleRefresh(delay = CONSTANTS.DELAYS.DOM_SETTLE) {
    window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshFromDOM();
    }, delay);
  }

  refreshFromDOM(isHeartbeat = false) {
    if (this.editingGroupIndex !== null) {
      return;
    }

    const chatId = this.getCurrentChatId();
    const chatChanged = chatId !== this.lastChatId;
    const { groups, signature } = ConversationExtractor.extractConversation();

    if (chatChanged) {
      this.lastChatId = chatId;
      this.collapsedGroups.clear();
      this.collapsedHeadings.clear();
      this.expandedHeadings.clear();
      this.searchTerm = "";
    }

    if (groups.length === 0) {
      this.groups = [];
      this.lastDataSignature = "";
      this.removeTOC();
      return;
    }

    const dataChanged = signature !== this.lastDataSignature;
    if (isHeartbeat && !chatChanged && !dataChanged) {
      return;
    }

    this.groups = groups;
    this.lastDataSignature = signature;

    this.ensureContainer();
    this.render();
  }

  ensureContainer() {
    if (this.container && !document.body.contains(this.container)) {
      this.container = null;
      this.searchContainer = null;
      this.contentContainer = null;
      this.searchInput = null;
      this.searchClear = null;
      this.dragManager = null;
    }

    const existing = document.getElementById(CONSTANTS.IDS.TOC_CONTAINER);
    if (existing && !this.container) {
      existing.remove();
    }

    if (this.container) {
      return;
    }

    const container = DOMManager.createTOCContainer();
    const header = DOMManager.createHeader();
    const searchContainer = DOMManager.createSearchContainer();
    const content = DOMManager.createContentContainer();

    container.appendChild(header);
    container.appendChild(searchContainer);
    container.appendChild(content);
    container.style.visibility = "hidden";

    document.body.appendChild(container);

    this.container = container;
    this.searchContainer = searchContainer;
    this.contentContainer = content;
    this.searchInput = container.querySelector(`#${CONSTANTS.IDS.SEARCH_INPUT}`);
    this.searchClear = container.querySelector(`#${CONSTANTS.IDS.SEARCH_CLEAR}`);

    this.searchInput.addEventListener("input", this.boundHandleSearchInput);
    this.searchClear.addEventListener("click", this.boundClearSearch);
    this.container.addEventListener("click", this.boundHandleContentClick);
    this.container.addEventListener("mouseenter", this.boundHandleMouseEnter);
    this.container.addEventListener("mouseleave", this.boundHandleMouseLeave);

    this.dragManager = new DragManager(container, PositionManager, {
      onCollapseChange: this.handlePanelCollapseChange.bind(this),
      onDragEnd: this.handleDragEnd.bind(this),
      onToggleButtonPress: this.handleToggleButtonPress.bind(this),
    });
    this.applyInitialPosition();
    this.setupResponsiveCollapse();
    this.updateHeaderActions();
    this.container.style.visibility = "";
  }

  removeTOC() {
    window.clearTimeout(this.autoCollapseTimer);

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove(
        CONSTANTS.CLASSES.TARGET_HIGHLIGHT,
      );
      this.highlightedElement = null;
    }

    this.container?.remove();
    this.container = null;
    this.searchContainer = null;
    this.contentContainer = null;
    this.searchInput = null;
    this.searchClear = null;
    this.dragManager = null;
    this.editingGroupIndex = null;
  }

  render() {
    if (!this.container || !this.contentContainer) {
      return;
    }

    this.searchInput.value = this.searchTerm;
    this.updateSearchControls();
    this.updateHeaderActions();

    const visibleGroups = this.getVisibleGroups();
    const fragment = document.createDocumentFragment();

    if (visibleGroups.length === 0) {
      fragment.appendChild(
        DOMManager.createStateMessage(
          "No matches",
          "Try a different keyword.",
        ),
      );
    } else {
      visibleGroups.forEach((group) => {
        fragment.appendChild(this.createGroupElement(group));
      });
    }

    this.contentContainer.replaceChildren(fragment);
    this.focusEditingInputIfNeeded();
  }

  getVisibleGroups() {
    const searchTerm = this.searchTerm.toLowerCase().trim();

    return this.groups.reduce((visible, group) => {
      const displayName = this.getDisplayName(group);
      const promptMatch = searchTerm
        ? `${displayName} ${group.promptText}`.toLowerCase().includes(searchTerm)
        : false;
      const visibleTree = searchTerm
        ? promptMatch
          ? group.headingTree
          : this.filterHeadingTree(group.headingTree, searchTerm)
        : group.headingTree;

      if (!searchTerm || promptMatch || visibleTree.length > 0) {
        visible.push({
          ...group,
          displayName,
          promptMatch,
          visibleTree,
        });
      }

      return visible;
    }, []);
  }

  filterHeadingTree(nodes, term) {
    return nodes.reduce((visible, node) => {
      const matches = node.text.toLowerCase().includes(term);
      const visibleChildren = this.filterHeadingTree(node.children, term);

      if (matches || visibleChildren.length > 0) {
        visible.push({
          ...node,
          isMatch: matches,
          children: visibleChildren,
        });
      }

      return visible;
    }, []);
  }

  getDisplayName(group) {
    if (group.promptElement) {
      return group.promptText;
    }

    return group.headings[0]?.text || "Answer only";
  }

  createGroupElement(group) {
    const searchActive = Boolean(this.searchTerm.trim());
    const isCollapsed =
      !searchActive && this.collapsedGroups.has(group.index);
    const hasHeadingTree = group.visibleTree.length > 0;
    const hasContent = Boolean(group.messageElement) && hasHeadingTree;
    const section = document.createElement("section");
    section.className = "toc-group";
    section.dataset.groupIndex = String(group.index);

    if (isCollapsed) {
      section.classList.add("is-collapsed");
    }

    const header = document.createElement("div");
    header.className = "toc-group-header";

    const info = document.createElement("button");
    info.type = "button";
    info.className = "toc-group-jump";
    info.dataset.action = "scroll-group";
    info.dataset.groupIndex = String(group.index);
    info.title = group.displayName;
    info.textContent = group.displayName;

    const actions = document.createElement("div");
    actions.className = "toc-group-actions";

    const countChip = document.createElement("span");
    countChip.className = "toc-group-count";
    countChip.textContent = this.getCountLabel(group);
    actions.appendChild(countChip);

    if (hasContent) {
      const collapseButton = DOMManager.createActionButton(
        "toc-icon-button toc-collapse-btn",
        isCollapsed ? "Expand group" : "Collapse group",
        isCollapsed ? ICONS.CHEVRON_RIGHT : ICONS.CHEVRON_DOWN,
      );
      collapseButton.dataset.action = "toggle-group";
      collapseButton.dataset.groupIndex = String(group.index);
      collapseButton.disabled = searchActive;
      if (searchActive) {
        collapseButton.classList.add("is-disabled");
      }
      actions.appendChild(collapseButton);
    }

    header.appendChild(info);
    header.appendChild(actions);
    section.appendChild(header);

    if (hasContent) {
      const content = document.createElement("div");
      content.className = "toc-group-content";
      content.hidden = isCollapsed;

      const tree = document.createElement("div");
      tree.className = "toc-heading-tree";

      group.visibleTree.forEach((node) => {
        tree.appendChild(
          this.createHeadingNodeElement(group.index, node, searchActive, 0),
        );
      });

      content.appendChild(tree);
      section.appendChild(content);
    }

    return section;
  }

  createHeadingNodeElement(groupIndex, node, searchActive, depth) {
    const wrapper = document.createElement("div");
    wrapper.className = "toc-heading-node";

    const row = document.createElement("div");
    row.className = "toc-heading-row";
    row.style.setProperty("--toc-depth", String(depth));
    if (node.isMatch) {
      row.classList.add("is-match");
    }

    const jumpButton = document.createElement("button");
    jumpButton.type = "button";
    jumpButton.className = "toc-heading-jump";
    jumpButton.dataset.action = "scroll-heading";
    jumpButton.dataset.groupIndex = String(groupIndex);
    jumpButton.dataset.headingIndex = String(node.index);
    jumpButton.title = node.text;

    const levelChip = document.createElement("span");
    levelChip.className = "toc-heading-level";
    levelChip.textContent = `H${node.level}`;

    const text = document.createElement("span");
    text.className = "toc-heading-text";
    text.textContent = node.text;

    jumpButton.appendChild(levelChip);
    jumpButton.appendChild(text);
    row.appendChild(jumpButton);

    const hasChildren = node.children.length > 0;
    if (hasChildren) {
      const isCollapsed = this.isHeadingCollapsed(
        groupIndex,
        node,
        searchActive,
      );
      const toggleButton = DOMManager.createActionButton(
        "toc-icon-button toc-heading-toggle",
        isCollapsed ? "Expand subheadings" : "Collapse subheadings",
        isCollapsed ? ICONS.CHEVRON_RIGHT : ICONS.CHEVRON_DOWN,
      );
      toggleButton.dataset.action = "toggle-heading";
      toggleButton.dataset.groupIndex = String(groupIndex);
      toggleButton.dataset.headingIndex = String(node.index);
      toggleButton.disabled = searchActive;
      if (searchActive) {
        toggleButton.classList.add("is-disabled");
      }

      row.appendChild(toggleButton);
      wrapper.appendChild(row);

      const children = document.createElement("div");
      children.className = "toc-heading-children";
      children.hidden = isCollapsed;

      node.children.forEach((child) => {
        children.appendChild(
          this.createHeadingNodeElement(
            groupIndex,
            child,
            searchActive,
            depth + 1,
          ),
        );
      });

      wrapper.appendChild(children);
      return wrapper;
    }

    wrapper.appendChild(row);
    return wrapper;
  }

  getCountLabel(group) {
    if (!group.messageElement) {
      return "Pending";
    }

    if (group.headings.length === 0) {
      return "0";
    }

    return String(group.headings.length);
  }

  updateSearchControls() {
    if (!this.searchClear || !this.searchContainer || !this.container) {
      return;
    }

    const shouldShowSearch = this.isSearchOpen || Boolean(this.searchTerm);
    this.searchContainer.classList.toggle("is-open", shouldShowSearch);
    this.searchClear.style.display = this.searchTerm ? "flex" : "none";
  }

  updateHeaderActions() {
    if (!this.container) {
      return;
    }

    const searchActive = Boolean(this.searchTerm);
    const actionButtons = this.container.querySelectorAll(".toc-bulk-button");
    actionButtons.forEach((button) => {
      button.disabled = searchActive;
      button.classList.toggle("is-disabled", searchActive);
    });

    const searchButton = this.container.querySelector(
      `#${CONSTANTS.IDS.TOC_SEARCH_TOGGLE_BTN}`,
    );
    if (searchButton) {
      const searchActiveState = this.isSearchOpen || Boolean(this.searchTerm);
      searchButton.classList.toggle("is-active", searchActiveState);
      searchButton.title = searchActiveState ? "Close search" : "Open search";
      searchButton.setAttribute(
        "aria-label",
        searchActiveState ? "Close search" : "Open search",
      );
    }

    const pinButton = this.container.querySelector(`#${CONSTANTS.IDS.TOC_PIN_BTN}`);
    if (pinButton) {
      const label = this.isPinned ? "Unpin panel" : "Pin open panel";
      pinButton.classList.toggle("is-active", this.isPinned);
      pinButton.title = label;
      pinButton.setAttribute("aria-label", label);
    }
  }

  focusEditingInputIfNeeded() {
    if (!this.focusEditOnRender) {
      return;
    }

    const input = this.contentContainer?.querySelector(".toc-group-edit-input");
    if (!input) {
      return;
    }

    this.focusEditOnRender = false;
    window.requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }

  handleSearchInput(event) {
    this.searchTerm = event.target.value.trim();
    this.render();
  }

  clearSearch() {
    this.searchTerm = "";
    this.render();
    this.searchInput?.focus();
  }

  toggleSearch() {
    if (this.isSearchOpen || this.searchTerm) {
      this.isSearchOpen = false;
      this.searchTerm = "";
      if (this.searchInput) {
        this.searchInput.value = "";
      }
      this.render();
      return;
    }

    this.isSearchOpen = true;
    this.updateSearchControls();
    this.updateHeaderActions();
    this.searchInput?.focus();
  }

  handleContentClick(event) {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const groupIndex = Number(actionElement.dataset.groupIndex);
    const headingIndex = Number(actionElement.dataset.headingIndex);

    if (action === "scroll-group") {
      this.scrollToGroup(groupIndex);
      return;
    }

    if (action === "edit-group") {
      this.editingGroupIndex = groupIndex;
      this.focusEditOnRender = true;
      this.render();
      return;
    }

    if (action === "toggle-search") {
      this.toggleSearch();
      return;
    }

    if (action === "toggle-pin") {
      this.togglePinned();
      return;
    }

    if (action === "expand-all") {
      this.expandAll();
      return;
    }

    if (action === "collapse-all") {
      this.collapseAll();
      return;
    }

    if (action === "toggle-group") {
      this.toggleGroupCollapse(groupIndex);
      return;
    }

    if (action === "scroll-heading") {
      this.scrollToHeading(groupIndex, headingIndex);
      return;
    }

    if (action === "toggle-heading") {
      this.toggleHeadingCollapse(groupIndex, headingIndex);
    }
  }

  toggleGroupCollapse(groupIndex) {
    if (this.searchTerm) {
      return;
    }

    if (this.collapsedGroups.has(groupIndex)) {
      this.collapsedGroups.delete(groupIndex);
    } else {
      this.collapsedGroups.add(groupIndex);
    }

    this.render();
  }

  expandAll() {
    if (this.searchTerm) {
      return;
    }

    this.expandPanel();
    this.collapsedGroups.clear();
    this.collapsedHeadings.clear();
    this.expandedHeadings = new Set(this.getDefaultCollapsedHeadingKeys());
    this.render();
  }

  collapseAll() {
    if (this.searchTerm) {
      return;
    }

    this.collapsedGroups = new Set(
      this.groups
        .filter(
          (group) => Boolean(group.messageElement) && group.headingTree.length > 0,
        )
        .map((group) => group.index),
    );
    this.render();
  }

  toggleHeadingCollapse(groupIndex, headingIndex) {
    if (this.searchTerm) {
      return;
    }

    const key = this.getHeadingCollapseKey(groupIndex, headingIndex);
    const heading = this.getHeading(groupIndex, headingIndex);
    if (!heading) {
      return;
    }

    if (this.isDefaultCollapsed(heading.level)) {
      if (this.expandedHeadings.has(key)) {
        this.expandedHeadings.delete(key);
      } else {
        this.expandedHeadings.add(key);
      }
      this.render();
      return;
    }

    if (this.collapsedHeadings.has(key)) {
      this.collapsedHeadings.delete(key);
    } else {
      this.collapsedHeadings.add(key);
    }

    this.render();
  }

  getHeadingCollapseKey(groupIndex, headingIndex) {
    return `${groupIndex}-${headingIndex}`;
  }

  getHeading(groupIndex, headingIndex) {
    const group = this.groups.find((item) => item.index === groupIndex);
    return group?.headings.find((item) => item.index === headingIndex) || null;
  }

  isDefaultCollapsed(level) {
    return level > 1;
  }

  isHeadingCollapsed(groupIndex, node, searchActive) {
    if (searchActive) {
      return false;
    }

    const key = this.getHeadingCollapseKey(groupIndex, node.index);
    if (this.isDefaultCollapsed(node.level)) {
      return !this.expandedHeadings.has(key);
    }

    return this.collapsedHeadings.has(key);
  }

  getDefaultCollapsedHeadingKeys() {
    const keys = [];

    this.groups.forEach((group) => {
      group.headingTree.forEach((node) => {
        this.collectCollapsedHeadingKeys(group.index, node, keys);
      });
    });

    return keys;
  }

  collectCollapsedHeadingKeys(groupIndex, node, keys) {
    if (node.level > 1 && node.children.length > 0) {
      keys.push(this.getHeadingCollapseKey(groupIndex, node.index));
    }

    node.children.forEach((child) => {
      this.collectCollapsedHeadingKeys(groupIndex, child, keys);
    });
  }

  scrollToGroup(groupIndex) {
    const group = this.groups.find((item) => item.index === groupIndex);
    const target = group?.promptElement || group?.messageElement;
    this.scrollToElement(target);
  }

  scrollToHeading(groupIndex, headingIndex) {
    const group = this.groups.find((item) => item.index === groupIndex);
    const heading = group?.headings.find((item) => item.index === headingIndex);
    this.scrollToElement(heading?.element);
  }

  scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (this.highlightedElement && this.highlightedElement !== element) {
      this.highlightedElement.classList.remove(
        CONSTANTS.CLASSES.TARGET_HIGHLIGHT,
      );
    }

    element.classList.add(CONSTANTS.CLASSES.TARGET_HIGHLIGHT);
    this.highlightedElement = element;

    window.clearTimeout(this.highlightTimer);
    this.highlightTimer = window.setTimeout(() => {
      if (this.highlightedElement) {
        this.highlightedElement.classList.remove(
          CONSTANTS.CLASSES.TARGET_HIGHLIGHT,
        );
        this.highlightedElement = null;
      }
    }, CONSTANTS.DELAYS.HIGHLIGHT);
  }

  handleWindowResize() {
    if (!this.container) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const constrained = PositionManager.constrainToViewport(
      rect.left,
      rect.top,
      this.container.offsetWidth,
      this.container.offsetHeight,
    );

    if (
      Math.abs(constrained.x - rect.left) > 1 ||
      Math.abs(constrained.y - rect.top) > 1
    ) {
      PositionManager.applyPosition(this.container, constrained.x, constrained.y);
      PositionManager.savePosition(constrained.x, constrained.y);
    }
  }

  handleDocumentClick(event) {
    if (event.target.closest(CONSTANTS.SELECTORS.SEND_BUTTON)) {
      this.scheduleRefresh(CONSTANTS.DELAYS.PROMPT_SUBMISSION);
    }
  }

  handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      document.activeElement?.id ===
        CONSTANTS.SELECTORS.PROMPT_TEXTAREA.replace("#", "")
    ) {
      this.scheduleRefresh(CONSTANTS.DELAYS.ENTER_KEY);
    }
  }

  setupResponsiveCollapse() {
    if (!this.container) {
      return;
    }

    if (this.isPinned) {
      this.expandPanel();
      return;
    }

    this.collapsePanel();
  }

  applyInitialPosition() {
    if (!this.container) return;

    const savedPosition = PositionManager.getSavedPosition();
    const rect = this.container.getBoundingClientRect();
    const startX = savedPosition?.x ?? rect.left;
    const startY = savedPosition?.y ?? rect.top;
    const constrained = PositionManager.constrainToViewport(
      startX,
      startY,
      this.container.offsetWidth,
      this.container.offsetHeight,
    );

    PositionManager.applyPosition(this.container, constrained.x, constrained.y);
    PositionManager.savePosition(constrained.x, constrained.y);
  }

  getCurrentChatId() {
    const match = window.location.href.match(/\/c\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  getPinnedState() {
    return localStorage.getItem(CONSTANTS.STORAGE_KEY_PINNED) === "true";
  }

  savePinnedState() {
    localStorage.setItem(CONSTANTS.STORAGE_KEY_PINNED, String(this.isPinned));
  }

  isPanelCollapsed() {
    return this.container?.classList.contains(CONSTANTS.CLASSES.COLLAPSED);
  }

  expandPanel() {
    window.clearTimeout(this.autoCollapseTimer);

    if (!this.container || !this.dragManager || !this.isPanelCollapsed()) {
      return;
    }

    this.dragManager.toggleCollapse(true);
  }

  collapsePanel() {
    window.clearTimeout(this.autoCollapseTimer);

    if (!this.container || !this.dragManager || this.isPanelCollapsed()) {
      return;
    }

    this.dragManager.toggleCollapse(false);
  }

  scheduleAutoCollapse() {
    if (this.isPinned) {
      return;
    }

    window.clearTimeout(this.autoCollapseTimer);
    this.autoCollapseTimer = window.setTimeout(() => {
      if (
        this.isPinned ||
        !this.container ||
        this.isPanelCollapsed() ||
        this.dragManager?.isDragging ||
        this.container.matches(":hover")
      ) {
        return;
      }

      this.collapsePanel();
    }, CONSTANTS.DELAYS.HOVER_COLLAPSE);
  }

  handleMouseEnter() {
    window.clearTimeout(this.autoCollapseTimer);

    if (!this.isPinned) {
      this.expandPanel();
    }
  }

  handleMouseLeave() {
    if (this.isPinned || this.editingGroupIndex !== null) {
      return;
    }

    this.scheduleAutoCollapse();
  }

  handlePanelCollapseChange(isCollapsed) {
    if (isCollapsed) {
      window.clearTimeout(this.autoCollapseTimer);
    }

    this.updateHeaderActions();
  }

  handleDragEnd() {
    if (!this.isPinned && this.container && !this.container.matches(":hover")) {
      this.scheduleAutoCollapse();
    }
  }

  handleToggleButtonPress(isCollapsed) {
    if (!isCollapsed && this.isPinned) {
      this.isPinned = false;
      this.savePinnedState();
      this.updateHeaderActions();
    }

    window.clearTimeout(this.autoCollapseTimer);
    return true;
  }

  togglePinned() {
    this.isPinned = !this.isPinned;
    this.savePinnedState();

    if (this.isPinned) {
      this.expandPanel();
    } else if (!this.container?.matches(":hover")) {
      this.scheduleAutoCollapse();
    }

    this.updateHeaderActions();
  }
}

new TOCExtension();
