/*
 * Backbone Eventbroker v{{version}}
 *
 * This version is for use with RequireJS
 * If using regular <script> tags to include your files, use backbone-memory.min.js
 *
 * Copyright (c) 2012  - 2013 Eric Feminella, Sven Lito
 * License and more information at: http://code.ericfeminella.com/license/LICENSE.txt
 *
 */
define( function($, Backbone, _) {
    var _ = require('underscore')
      , $ = require('jquery')
      , Backbone = require('backbone')

    "use strict";

{{body}}
    // exports
    return Backbone.EventBroker;
});
