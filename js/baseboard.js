/**
 * search
 */
const createSeach = (config) => {
    const engine = document.getElementById("engine");
    config.forEach(element => {
        let opt = document.createElement("option");
        opt.setAttribute('value', element.url);
        opt.text = element.text;
        engine.appendChild(opt);
    });
}
const search = (e) => {
    e.preventDefault();
    location.replace(`${e.target.engine.value}${e.target.q.value}`);
}


/**
 * Button
 */
const createPanels = (panels) => {
    Object.entries(panels).forEach(([key, value]) => {
        const panel = document.createElement('div');
        panel.setAttribute('class', 'rounded-2 shadow panel');
        panel.innerHTML = `<span class="panel-title">${key}</span>`;

        if (typeof value.style !== "undefined") {
            Object.entries(value.style).forEach(([k, v]) => {
                panel.style.setProperty(k, v);
            });
        }

        value.items.forEach(item => {
            switch (item.type) {
                case "hr":
                    createHr(item, panel);
                    break;
                case "image":
                    createImage(item, panel);
                    break;
                default:
                    createButton(item, panel);
            }
        });


        document.getElementById("main").appendChild(panel);
    });
}

const createButton = (item, panel) => {
    const button = document.createElement('a');
    button.setAttribute('class', 'btn btn-outline-secondary item-btn d-flex');
    button.setAttribute('href', item.href);
    if (typeof item.newtab === "undefined" || item.newtab) button.setAttribute('target', '_blank');

    if (typeof item.style !== "undefined") {
        Object.entries(item.style).forEach(([k, v]) => {
            button.style.setProperty(k, v);
        });
    }

    if (typeof item.classes !== "undefined") {
        item.classes.forEach(v => {
            button.classList.add(v);
        });
    }

    const icon_img = document.createElement('img');
    icon_img.setAttribute('class', 'icon');
    icon_img.setAttribute('src', item.img);
    button.appendChild(icon_img);

    if (typeof item.title !== "undefined") {
        const title = document.createElement('span');
        title.setAttribute('class', 'ms-1');

        if (typeof item.description !== "undefined") {
            title.innerHTML = `<div class="title">${item.title}</div><div class="description">${item.description}</div>`;
        } else {
            title.innerHTML = `<div class="title">${item.title}</div>`;
        }

        const right_div = document.createElement('div');
        right_div.setAttribute('class', 'ms-auto');


        const right_top_div = document.createElement('div');
        right_top_div.setAttribute('style', 'height: 14px; margin-top: -10px; margin-right: 1px');
        right_top_div.innerHTML = `<img src=${(typeof item.newtab === "undefined" || item.newtab) ? 'images/icons/arrow.png' : 'images/icons/blank.png'} class="icon-target" />`;

        const right_bottom_div = document.createElement('div');
        right_bottom_div.setAttribute('style', 'margin-top: 10px;');
        right_bottom_div.innerHTML = `<img src="images/icons/blank.png" class="icon-check-error" />`;

        right_div.appendChild(right_top_div);
        right_div.appendChild(right_bottom_div);

        button.appendChild(title);
        button.appendChild(right_div);
        if (item.check_online) check_online(item, right_bottom_div);
    }
    panel.appendChild(button);
}

const createImage = (item, panel) => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    div.setAttribute('class', 'item-img');
    img.setAttribute('src', item.img);

    img.style.setProperty("width", "100%");
    if (typeof item.style !== "undefined") {
        Object.entries(item.style).forEach(([k, v]) => {
            img.style.setProperty(k, v);
        });
    }
    div.appendChild(img);
    panel.appendChild(div);
}

const createHr = (item, panel) => {
    const hr = document.createElement('hr');
    panel.appendChild(hr);
}

const check_online = (item, div) => {
    div.innerHTML = '<img src="images/icons/checking.gif" class="icon-check-error" title="Checking"/>';
    var img = document.createElement("img");
    img.onload = function () {
        div.innerHTML = '<img src="images/icons/check.png" class="icon-check-error" title="Online"/>';
    }
    img.onerror = function () {
        div.innerHTML = '<img src="images/icons/error.png" class="icon-check-error" title="Offline"/>';
    }
    img.src = `${item.href}/${item.check_online}`;
}

/**
 * Backgound
 */
const createBackgrounds = (config) => {
    const style = document.documentElement.style;
    let currentImg = Math.floor(Math.random() * config.images.length);                                           // random selection
    style.background = `url(${config.base_dir}${config.images[currentImg]}) no-repeat center center fixed`;
    style.backgroundSize = 'cover';



    if (config.images.length > 1) {
        config.images.forEach(function (img) { new Image().src = config.base_dir + img; });                          // preload images

        setInterval(() => {
            let rand_index = 0;
            do {                                                                                                    // select new image and make sure it is not the same as the current
                rand_index = Math.floor(Math.random() * config.images.length);
            } while (currentImg == rand_index);

            currentImg = rand_index;                                                                                // make the new image as the current
            style.background = `url(${config.base_dir}${config.images[currentImg]}) no-repeat center center fixed`;
            style.backgroundSize = 'cover';
            style.transition = '2s';
        }, config.image_delay * 1000);                                                                              // delay in seconds as per config
    }
}

/**
 * Load the conponents
 */
const run = (config) => {
    document.getElementById('footer_text').innerHTML = config.footer;
    editor.setValue(JSON.stringify(config, null, '    '));
    createSeach(config.search_engines);
    createPanels(config.panels);
    createBackgrounds(config.background);
}


/**
 * CodeMirror setup
 */
var editor = CodeMirror.fromTextArea(document.getElementById('config_editor'), {
    mode: { name: "javascript", json: true },
    lineNumbers: true,
    autoRefresh: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
});
editor.setOption('theme', 'neat');
editor.setSize(null, '100%');




/**
 * starting point
 */
if (config) {
    run(config);
} else {
    fetch('config.json')
        .then(response => response.json())
        .then(response => {
            run(response);
        })
        .catch(error => {
            alert("Can not load config.json file");
        });
}