describe('bootbox dialog queue', function() {
  'use strict';

  function waitFor(event, dialog, timeoutMs) {
    return new Promise(function(resolve, reject) {
      let timer = setTimeout(function() {
        reject(new Error('Timed out waiting for ' + event));
      }, timeoutMs || 2000);

      dialog.one(event, function(e) {
        if (e.target === dialog[0]) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  }

  function dismiss(dialog) {
    let hidden = waitFor('hidden.bs.modal', dialog);
    dialog.find('.bootbox-accept').first().trigger('click');
    return hidden;
  }

  function visibleBootboxes() {
    return $('.bootbox.show');
  }

  function whenParked(dialog) {
    if (!dialog.hasClass('show')) {
      return Promise.resolve();
    }
    return waitFor('hidden.bs.modal', dialog);
  }

  function resetDom() {
    bootbox.setDefaults({ queue: true, animate: false });
    bootbox.clearQueue();
    $('.bootbox').remove();
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
  }

  beforeEach(function() {
    resetDom();
  });

  afterEach(function() {
    resetDom();
  });

  describe('with queue enabled (default)', function() {
    it('parks the first alert when a second opens', function() {
      let first = bootbox.alert({ message: 'first', animate: false });
      let parked = whenParked(first);
      let second = bootbox.alert({ message: 'second', animate: false });

      return parked.then(function() {
        expect(visibleBootboxes().length).to.equal(1);
        expect(second.hasClass('show')).to.be.true;
        expect(first.hasClass('show')).to.be.false;
        expect(first.parent().length).to.equal(1);
        expect(first.find('.bootbox-body').text()).to.equal('first');
        expect(second.find('.bootbox-body').text()).to.equal('second');
      });
    });

    it('restores the previous dialog after the top is dismissed', function() {
      let first = bootbox.alert({ message: 'first', animate: false });
      let parked = whenParked(first);
      let second = bootbox.alert({ message: 'second', animate: false });

      return parked.then(function() {
        let restored = waitFor('shown.bs.modal', first);
        return dismiss(second).then(function() {
          return restored;
        });
      }).then(function() {
        expect(visibleBootboxes().length).to.equal(1);
        expect(first.hasClass('show')).to.be.true;
        expect(second.parent().length).to.equal(0);
      });
    });

    it('restores in LIFO order across three dialogs', function() {
      let first = bootbox.alert({ message: 'first', animate: false });
      let firstParked = whenParked(first);
      let second = bootbox.alert({ message: 'second', animate: false });
      let third;

      return firstParked.then(function() {
        let secondParked = whenParked(second);
        third = bootbox.alert({ message: 'third', animate: false });
        return secondParked;
      }).then(function() {
        let secondRestored = waitFor('shown.bs.modal', second);
        return dismiss(third).then(function() {
          return secondRestored;
        });
      }).then(function() {
        expect(second.hasClass('show')).to.be.true;
        let firstRestored = waitFor('shown.bs.modal', first);
        return dismiss(second).then(function() {
          return firstRestored;
        });
      }).then(function() {
        expect(first.hasClass('show')).to.be.true;
        expect(visibleBootboxes().length).to.equal(1);
      });
    });

    it('hideAll / dismissAll clears active and parked without restore', function() {
      let first = bootbox.alert({ message: 'first', animate: false });
      let parked = whenParked(first);
      bootbox.alert({ message: 'second', animate: false });

      return parked.then(function() {
        bootbox.dismissAll();
        expect($('.bootbox').length).to.equal(0);
        expect(visibleBootboxes().length).to.equal(0);
      });
    });

    it('keeps the top dialog when a callback returns false', function() {
      let first = bootbox.alert({ message: 'first', animate: false });
      let parked = whenParked(first);
      let second = bootbox.alert({
        message: 'second',
        animate: false,
        callback: function() {
          return false;
        }
      });

      return parked.then(function() {
        second.find('.bootbox-accept').first().trigger('click');
        expect(second.hasClass('show')).to.be.true;
        expect(first.hasClass('show')).to.be.false;
        expect(first.parent().length).to.equal(1);
      });
    });

    it('preserves prompt input value across park and restore', function() {
      let prompt = bootbox.prompt({
        title: 'Name',
        animate: false,
        value: 'kept',
        callback: function() {}
      });
      let alert;

      prompt.find('.bootbox-input').val('typed-value');
      let parked = whenParked(prompt);
      alert = bootbox.alert({ message: 'interrupt', animate: false });

      return parked.then(function() {
        let restored = waitFor('shown.bs.modal', prompt);
        return dismiss(alert).then(function() {
          return restored;
        });
      }).then(function() {
        expect(prompt.find('.bootbox-input').val()).to.equal('typed-value');
        expect(prompt.hasClass('show')).to.be.true;
      });
    });

    it('keeps reusable dialogs in the DOM after park and final dismiss-all', function() {
      let first = bootbox.alert({ message: 'first', animate: false, reusable: true });
      let parked = whenParked(first);
      bootbox.alert({ message: 'second', animate: false });

      return parked.then(function() {
        expect(first.parent().length).to.equal(1);
        bootbox.hideAll();
        expect(first.parent().length).to.equal(1);
        expect($('.bootbox').filter(function() {
          return $(this).find('.bootbox-body').text() === 'second';
        }).length).to.equal(0);
      });
    });
  });

  describe('with queue: false', function() {
    it('allows concurrent open dialogs', function() {
      bootbox.setDefaults({ queue: false, animate: false });

      let first = bootbox.alert({ message: 'first', animate: false, queue: false });
      let second = bootbox.alert({ message: 'second', animate: false, queue: false });

      expect(first.hasClass('show')).to.be.true;
      expect(second.hasClass('show')).to.be.true;
      expect(visibleBootboxes().length).to.equal(2);
    });
  });
});
