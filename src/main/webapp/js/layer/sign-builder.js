define([ ], function() {

  "use strict";

  var SignBuilder = {};
  /**
   * Completely rebuild the sign. This is required when zoom changes as maps API
   * does not provide any method of scaling HTML content with zoom
   */
  SignBuilder.build = function(state, scale, animations) {
    if (state.box === null) {
      return;
    }
    state.box.div.innerHTML = '';
    var group = state.data.group;

    var i, length, datum;
    var width = 0;
    var height = 0;
    var value;
    var div, img;
    var elementWidth, elementHeight;
    var paddingWidth, paddingHeight;
    var textLine;
    var textLinesIndex, textLinesLength;
    var pictogramRegex = /(SY\d+)(.*)/;
    var vmsLines;
    var pictogramWidth, pictogramHeight;
    var propWidthFont;
    var matches;
    var signalDivs = [];
    var features = {};
    var aspectRatio = 114.0 / 122.0;
    var signalWidth = 29;
    var signalHeight = signalWidth * aspectRatio;

    var fontSize = 16;

    var lineHeight = fontSize + 2;
    var charWidth = fontSize * 0.7;

    charWidth = Math.floor(charWidth * scale);
    fontSize = Math.floor(fontSize * scale);
    lineHeight = Math.floor(lineHeight * scale);
    signalWidth = Math.floor(signalWidth * scale);
    signalHeight = Math.floor(signalHeight * scale);

    for (i = 0, length = group.length; i < length; i++) {
      datum = group[i];
      div = document.createElement('div');

      if (datum.w) {
        value = datum.value;

        elementWidth = Math.floor(datum.w * charWidth);
        elementHeight = datum.h * lineHeight;
        propWidthFont = datum.type.indexOf("MS4") >= 0;

        if (value) {
          div.style.fontSize = fontSize + "px";
          div.style.lineHeight = lineHeight + "px";
          vmsLines = [];

          for (textLinesIndex = 0, textLinesLength = value.length; textLinesIndex < textLinesLength; textLinesIndex++) {
            textLine = value[textLinesIndex];
            matches = pictogramRegex.exec(textLine);
            if (matches !== null) {
              pictogramHeight = Math.floor(elementHeight - lineHeight * value.length);
              pictogramWidth = Math.floor(pictogramHeight * aspectRatio[textLine.toLowerCase()]);
              vmsLines.push('<img src="img/v/' + matches[1].toLowerCase() + '.png" width="' + pictogramWidth + '" height="' + pictogramHeight + '" />');
              if (matches[2]) {
                vmsLines.push(matches[2]);
              }
            } else {
              vmsLines.push(textLine);
            }
          }
          if (propWidthFont) {
            div.innerHTML = vmsLines.join('<br/>');
          } else {
            div.innerHTML = vmsLines.join('<br/>').toLowerCase();
          }
        }
        if (propWidthFont) {
          div.className = 'vms vms-prop';
        } else {
          div.className = 'vms vms-fixed';
        }

        paddingHeight = 6;
        paddingWidth = 6;
        features[datum.id] = div;

      } else {
        value = datum.value || "off";
        div.className = 'signal';

        elementWidth = signalWidth;
        elementHeight = signalHeight;
        paddingHeight = 0;
        paddingWidth = 0;
        img = document.createElement('img');
        if (animations) {
          img.setAttribute('src', 'img/s/' + value + '.gif');
        } else {
          img.setAttribute('src', 'img/s/' + value + '.png');
        }
        img.setAttribute('width', elementWidth);
        img.setAttribute('height', elementHeight);
        elementWidth += 2; // border
        elementHeight += 2; // border
        signalDivs.push(div);
        div.appendChild(img);
        features[datum.id] = img;
      }
      height = Math.max(height, elementHeight + paddingHeight);

      div.style.width = elementWidth + "px";
      div.style.height = elementHeight + "px";

      width += (elementWidth + paddingWidth);

      div.setAttribute("data-id", datum.id);

      state.box.div.appendChild(div);
    }
    state.features = features;
    state.box.width = width;
    state.box.height = height;
    state.box.div.className = "gantry";
    state.box.div.style.width = width + 'px';
    state.box.div.style.height = height + 'px';

    for (i = 0, length = signalDivs.length; i < length; i++) {
      signalDivs[i].style.marginTop = Math.floor((height - signalHeight - 2) / 2) + "px";
    }
  };
  return SignBuilder;
});