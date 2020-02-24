module.exports = function (md, options) {
  var CONTENT_REG = /\\?\{([^}]+)\}/;
  md.core.ruler.push('h_attr', function (state) {
    var tokens = state.tokens;
    tokens.forEach(function (token, i) {
      var type = token.type;
      if (type == 'heading_open') {
        var attr = getAttr(tokens[i + 1]);
        if (attr) {
          setAttr(token, attr.name, attr.value);
        }
      }
      if (type == 'inline') {
        token.content = token.content.replace(CONTENT_REG, '')
        if (token.children) {
          token.children = token.children.map((child) => {
            if (child.type == 'link_open') {
              var attrs = child.attrs;
              child.attrs = attrs.map((attr) => {
                if (attr[0] == 'href') {
                  var value = attr[1];
                  var href = value.replace(/[^\x00-\xff]+[0-9]+\-/, '');
                  attr[1] = href || value;
                }
                return attr;
              });
            }
            if (child.type == 'text') {
              child.content = child.content.replace(CONTENT_REG, '')
            }
            return child;
          });
        }
      }
    })
  })
  
  const originalHeadingOpen = md.renderer.rules.heading_open ||
    function (...args) {
      const [tokens, idx, options, , self] = args
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.heading_open = function (...args) {
    args[0].forEach(function (token, i) {
      if (token.type == 'heading_open') {
        var reg = /(\w+\s){(.*?)}/g
        args[0][i + 1].children[0].content = args[0][i + 1].children[0].content.replace(reg, '$1').trim()
      }
    })
    return originalHeadingOpen.apply(this, args)
  }

  function setAttr(token, name, value) {
    var attrs = token.attrs;
    token.attrs = attrs.map((attr) => {
      var key = attr[0];
      if (key == name) {
        attr[1] = value;
      }
      return attr;
    });
  }

  function getAttr(token) {
    var content = token.content
    var reg = /\w+\s{(.*?)}/g
    var name = content.replace(reg, '$1');
    var matches = name.match(CONTENT_REG) || [];
    var selector = matches[1];
    if (!selector) {
      selector = name.split('#')[1];
      if(!selector){
        return;
      }
      selector = '#' + selector;
    }
    var type = selector.substr(0, 1);
    var attr_v = selector.substr(1);
    var attrs = {
      '.': 'class',
      '#': 'id'
    };
    var attr_name = attrs[type] || '';
    return {
      name: attr_name,
      value: attr_v
    }
  }
}