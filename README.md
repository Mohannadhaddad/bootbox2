# Bootbox - Bootstrap powered alert, confirm and flexible dialog boxes

Please see http://bootboxjs.com for full usage instructions, or head over to http://paynedigital.com/bootbox for
the original writeup about the project.

## Examples

Open [`examples/index.html`](examples/index.html) in a local static server (for example `npx serve .`) for interactive demos of alert, confirm, prompt, custom dialogs, and the **new LIFO dialog queue** (highlighted).

## Contributing

Please see the [CONTRIBUTING](https://github.com/bootboxjs/bootbox/blob/master/CONTRIBUTING.md) file for guidelines.

## Running Tests

Tests are run using [Karma](http://karma-runner.github.io/0.8/index.html) using the Mocha test adapter. To run the tests yourself, simply run 

```
npm install
``` 

within the project followed by 

```
npm test
```

Tests are run against the generated files contained in the `/dist` directory - regenerate those files and run the Karma tests by simply running Grunt:

```
grunt
```

When submitting pull requests, ensure your tests pass. **Pull-requests with failing tests will be rejected.** See the
[CONTRIBUTING](https://github.com/bootboxjs/bootbox/blob/master/CONTRIBUTING.md) file for more information.

## A note on Bootstrap dependencies

Bootbox **6.0.0** is the first release to support Bootstrap 5.0.0.

Bootbox **5.0.0** is the first release to support Bootstrap 4.0.0.

Bootbox **4.0.0** is the first release to support Bootstrap 3.0.0.

Bootbox **3.3.0** is the *last* release to support Bootstrap 2.2.x.

Much more dependency information can be found [on the Bootbox website](http://bootboxjs.com/getting-started.html#bootbox-dependencies).

## 6.1.0 (Latest Release)

- **Dialog queue (default on):** opening a new dialog parks the current one; dismissing restores the previous (LIFO). Use `bootbox.hideAll()` / `bootbox.dismissAll()` to clear the stack, or `queue: false` for legacy concurrent stacking.
- Accessibility: `aria-modal`, `aria-labelledby` / `aria-describedby`, and a properly labeled close button.

Full write-up: [docs/DIALOG-QUEUE.md](docs/DIALOG-QUEUE.md).

For a full list of releases and changes please see [the changelog](https://github.com/bootboxjs/bootbox/blob/master/CHANGELOG.md).

## License

(The MIT License)

Copyright (C) 2011-2025 by Nick Payne <nick@kurai.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE
