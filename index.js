(function(window, document) {
  function init() {
    var graphs = [].slice.call(document.querySelectorAll('.fullscreen_trigger')),
      currentGraph = 0,
      selected = graphs.slice(),
      interval;

    /*
     * Create dom elements
     */
    var el = document.createElement('div'),
      nextButton = document.createElement('button'),
      prevButton = document.createElement('button'),
      startButton = document.createElement('button'),
      stopButton = document.createElement('button'),
      click = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
      }),
      closeButton = document.getElementById('cboxClose');

    prevButton.textContent = '<';
    nextButton.textContent = '>';
    startButton.textContent = 'Start';
    stopButton.textContent = 'Stop';

    el.appendChild(prevButton);
    el.appendChild(nextButton);
    el.appendChild(startButton);
    el.appendChild(stopButton);

    /*
     * Position widget
     * @todo less hardcoded positioning? 
     */
    function position(event) {
      // Styles
      el.style.position = 'fixed';
      el.style['z-index'] = '10000';
      if (event) {
        var superbar = document.getElementById('superbar')
        if (superbar) {
          if (superbar.offsetTop === 0 && window.scrollY === 0) {
            el.style.top = '64px';
          } else if (window.scrollY < 42) {
            el.style.top = (superbar.offsetTop - window.scrollY + 6) + 'px';
          } else {
            el.style.top = '22px';
          }

          el.style.right = '75px';
        }
      } else {
        el.style.top = '22px';
        el.style.right = '55px';
      }
    }

    /*
     * Bind checkboxes
     */
    function setupEnableGraph() {
      [].slice.call(document.querySelectorAll('.chart_controls')).forEach(function(item, index) {
        var checkbox = document.createElement('input')
        checkbox.checked = true
        checkbox.value = index
        checkbox.style.position = 'relative'
        checkbox.style.top = '2px'
        checkbox.style.cursor = 'pointer'
        checkbox.type = 'checkbox'
        checkbox.title = 'Toggle for cycling'
        checkbox.classList.add('datadog-cycle-checkbox')
        checkbox.addEventListener('change', function(e) {
          if(e.target.checked) {
            selected.push(graphs[parseInt(e.target.value)])
          } else {
            selected.splice(selected.indexOf(graphs[e.target.value]), 1)
          }
          currentGraph = 0
          if(window.localStorage) {
            window.localStorage.setItem('selected', selected)
          }
        })
        item.appendChild(checkbox)
      })
      
    }

    /**
     * Display last update time
     * $('#cboxContent .layered_graph .x.axis g').last().text()
     */

    /*
     * Bind close button action
     */
    function bindCloseButton() {
      // Remove previous listener
      if (closeButton) {
        closeButton.removeEventListener('click', close)
      }
      // Add listener
      closeButton = document.getElementById('cboxClose')
      if (closeButton) {
        closeButton.addEventListener('click', close)
      }
    }

    /*
     * Navigation functions
     */
    function next() {
      currentGraph = (currentGraph + 1) % selected.length;
      selected[currentGraph].dispatchEvent(click);
      render()
    };

    function prev() {
      if (currentGraph === 0) {
        currentGraph = selected.length - 1;
      } else {
        currentGraph--
      }
      selected[currentGraph].dispatchEvent(click);
      render()
    };

    function start() {
      if (interval) {
        clearInterval(interval)
      }
      selected[currentGraph].dispatchEvent(click);
      interval = setInterval(function() {
        next();
      }, 20000);
      startButton.disabled = true
      stopButton.disabled = false;
      render()
    };

    function stop() {
      clearInterval(interval);
      stopButton.disabled = true
      startButton.disabled = false;
      render()
    };

    function close(event) {
      stop()
      position(event)
    }

    function render() {
      position();
      bindCloseButton();
    }

    /*
     * Bind events
     */
    prevButton.addEventListener('click', prev);
    nextButton.addEventListener('click', next);
    startButton.addEventListener('click', start);
    stopButton.addEventListener('click', stop);

    window.addEventListener('scroll', position);

    /*
     * Inject
     */
    document.body.appendChild(el);

    start()
    setupEnableGraph()
  }

  /*
   * Handle DOM ready
   */
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init)
  }

  /**
   * Replace text given css selector.
   * @param  {String} selector CSS selector
   * @param  {String} text     replacement text
   */
  function replaceText(selector, text) {
    var nodes = document.querySelectorAll(selector)
    var numbers;
    // Random number generator
    if (text === '%random%' && nodes.length > 0 && window.crypto) {
      numbers = new Uint32Array(nodes.length);
      window.crypto.getRandomValues(numbers);
    }
    [].slice.call(document.querySelectorAll(selector))
      .forEach(function(element, index) {
        if (numbers) {
          text = numbers[index];
        }
        element.textContent = text;
      });
  }
  /*
   * Anonymize for screenshots.
   */
  function anonymize() {
    replaceText('span.scope', 'Some scope');
    replaceText('span.value', '%random%');
    replaceText('span.metric', 'Some metric')
    replaceText('span.average', '%random%')
    replaceText('.chart_title', 'Some Graph')
    replaceText('.chart_head .title', 'Some Graph')
    replaceText('.dash_title', 'Some Dashboard')
  }

  window.addEventListener('keypress', function(e) {
    if (e.keyCode === 46) {
      anonymize();
    }
  })
})(window, document);