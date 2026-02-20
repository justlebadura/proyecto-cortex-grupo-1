import $ from 'jquery';
if (typeof window !== 'undefined') {
  window.jQuery = $;
  window.$ = $;
  // Fix for react-mathquill: global is not defined
  if (typeof window.global === 'undefined') {
    window.global = window;
  }
  console.log('jQuery initialized for MathQuill');
}
