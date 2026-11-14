// Reset queue pointers between specs so a later dismiss cannot restore a
// dialog from a previous test. Do not remove dialog DOM here — many suites
// share this.dialog across sibling specs without recreating it.
afterEach(function() {
  'use strict';
  if (typeof bootbox === 'undefined') {
    return;
  }

  bootbox.setDefaults({ queue: true });
  bootbox.clearQueue();
});
