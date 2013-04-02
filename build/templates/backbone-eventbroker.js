/*
 * Backbone Eventbroker v{{version}}
 *
 * Copyright (c) 2012  - 2013 Eric Feminella, Sven Lito
 * License and more information at: http://code.ericfeminella.com/license/LICENSE.txt
 *
 */
;(function($, _, Backbone) {
    "use strict";
    {{body}}
    //EXPORTS
    //AMD (RequireJS) - For exporting as a module when Backbone and jQuery are on the page
    //If using RequireJS to load Backbone, Underscore and jQuery, use the AMD-specific file
    if (typeof define === 'function' && define.amd) {
        return define(function() {
            return Backbone.EventBroker;
        });
    }

    //CommonJS (NodeJS)
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = Backbone.EventBroker;
        return;
    }
}(jQuery, _, Backbone));
