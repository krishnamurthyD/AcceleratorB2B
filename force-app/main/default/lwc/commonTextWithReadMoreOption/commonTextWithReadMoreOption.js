import { LightningElement, api } from 'lwc';

/**
 * @component CommonTextWithReadMoreOption
 * @description A reusable LWC component that displays text with truncation and "Read more"/"Show less" toggle functionality.
 * When text exceeds the configured character limit, it shows a truncated version with a "Read more" link.
 * Users can expand to see full text and collapse back to truncated view.
 * 
 * @example
 * <c-common-text-with-read-more-option 
 *   full-text="Your long text here..." 
 *   truncate-length="150"
 *   read-more-label="Read more"
 *   show-less-label="Show less">
 * </c-common-text-with-read-more-option>
 */
export default class CommonTextWithReadMoreOption extends LightningElement {
  
  /**
   * @property {string} fullText
   * @description The complete text content to be displayed. When this text exceeds the truncateLength,
   * it will be truncated and a "Read more" link will appear.
   * @api - Exposed as public property, configurable from Experience Builder or parent components
   * @default ''
   */
  @api fullText = '';

  /**
   * @property {number|string} truncateLength
   * @description Maximum number of characters to display in collapsed state. If fullText exceeds this length,
   * truncation occurs. Accepts number or numeric string. Invalid values fallback to 100.
   * @api - Exposed as public property, configurable from Experience Builder or parent components
   * @default 100
   */
  @api truncateLength = 100;

  /**
   * @property {string} readMoreLabel
   * @description Text label displayed on the toggle link when content is collapsed (truncated).
   * Clicking this label expands the full text.
   * @api - Exposed as public property, configurable from Experience Builder or parent components
   * @default '... Read More'
   */
  @api readMoreLabel = '... Read More';

  /**
   * @property {string} showLessLabel
   * @description Text label displayed on the toggle link when content is expanded (full text visible).
   * Clicking this label collapses back to truncated view.
   * @api - Exposed as public property, configurable from Experience Builder or parent components
   * @default ' Show less'
   */
  @api showLessLabel = ' Show less';

  /**
   * @property {boolean} expanded
   * @description Internal reactive state that tracks whether the text is currently expanded (true) or collapsed (false).
   * When false, truncated text is shown. When true, full text is displayed.
   * @private - Not exposed to parent components
   * @default false
   */
  expanded = false;

  /**
   * @getter effectiveTruncateLength
   * @description Computes a safe, validated integer value from the truncateLength property.
   * Parses the input as integer and ensures it's a positive number greater than 0.
   * If parsing fails or value is invalid, returns 100 as fallback.
   * 
   * @returns {number} Validated truncate length (positive integer)
   * @example
   * // truncateLength = "150" → returns 150
   * // truncateLength = -5 → returns 100 (fallback)
   * // truncateLength = "abc" → returns 100 (fallback)
   */
  get effectiveTruncateLength() {
    const n = parseInt(this.truncateLength, 10);
    return Number.isInteger(n) && n > 0 ? n : 100;
  }

  /**
   * @getter isTruncated
   * @description Determines whether the component should render in truncated mode.
   * Returns true when ALL conditions are met:
   * - expanded is false (content is collapsed)
   * - fullText exists and is not empty
   * - fullText length exceeds effectiveTruncateLength
   * 
   * Used by template to conditionally render truncated vs full text sections.
   * 
   * @returns {boolean} true if content should be truncated, false otherwise
   * @example
   * // fullText = "Short", truncateLength = 100, expanded = false → returns false
   * // fullText = "Very long text...", truncateLength = 10, expanded = false → returns true
   * // fullText = "Very long text...", truncateLength = 10, expanded = true → returns false
   */
  get isTruncated() {
    return !this.expanded && this.fullText && this.fullText.length > this.effectiveTruncateLength;
  }

  /**
   * @getter truncatedText
   * @description Returns the text to display when component is in collapsed/truncated state.
   * Logic:
   * 1. If fullText is empty/null → returns empty string
   * 2. If content should NOT be truncated (short text or expanded) → returns fullText
   * 3. Otherwise → returns first N characters of fullText where N = effectiveTruncateLength
   * 
   * Note: Uses simple character-based slicing. Does NOT respect word boundaries.
   * For word-boundary truncation, replace slice logic with word-aware algorithm.
   * 
   * @returns {string} Text to display in truncated view
   * @example
   * // fullText = "", expanded = false → returns ""
   * // fullText = "Hello World", truncateLength = 5, expanded = false → returns "Hello"
   * // fullText = "Hello", truncateLength = 100, expanded = false → returns "Hello"
   */
  get truncatedText() {
    if (!this.fullText) return '';
    if (!this.isTruncated) return this.fullText;
    return this.fullText.slice(0, this.effectiveTruncateLength);
  }

  /**
   * @getter linkLabel
   * @description Returns the appropriate label for the toggle link based on current expansion state.
   * When expanded (full text visible) → returns showLessLabel
   * When collapsed (truncated) → returns readMoreLabel
   * 
   * @returns {string} Current label text for the toggle link
   * @example
   * // expanded = false → returns "... Read More"
   * // expanded = true → returns " Show less"
   */
  get linkLabel() {
    return this.expanded ? this.showLessLabel : this.readMoreLabel;
  }

  /**
   * @getter showCollapse
   * @description Determines whether to render the "Show less" collapse link in expanded state.
   * Returns true when BOTH conditions are met:
   * - expanded is true (full text is currently visible)
   * - fullText length exceeds effectiveTruncateLength (content was originally truncated)
   * 
   * This prevents showing "Show less" link for short content that doesn't need truncation.
   * Used by template to conditionally render the collapse link.
   * 
   * @returns {boolean} true if collapse link should be shown, false otherwise
   * @example
   * // fullText = "Short", expanded = true → returns false (no truncation needed)
   * // fullText = "Very long...", truncateLength = 10, expanded = true → returns true
   * // fullText = "Very long...", expanded = false → returns false (not expanded yet)
   */
  get showCollapse() {
    return this.expanded && this.fullText && this.fullText.length > this.effectiveTruncateLength;
  }

  /**
   * @method handleReadMoreClick
   * @description Event handler for the "Read more"/"Show less" toggle link click.
   * Performs two actions:
   * 1. Prevents default anchor navigation behavior (prevents # being added to URL)
   * 2. Toggles the expanded state (true ↔ false), triggering component re-render
   * 
   * Side effects:
   * - Changes expanded property value
   * - Causes template re-evaluation and DOM update
   * - No custom events dispatched (contained behavior)
   * 
   * @param {Event} event - DOM click event from the anchor element
   * @returns {void}
   * 
   * @example
   * // User clicks "Read more" → expanded changes false→true, full text renders
   * // User clicks "Show less" → expanded changes true→false, truncated text renders
   * 
   * @fires none - This method does not dispatch custom events
   */
  handleReadMoreClick(event) {
    event.preventDefault();
    this.expanded = !this.expanded;
  }
}