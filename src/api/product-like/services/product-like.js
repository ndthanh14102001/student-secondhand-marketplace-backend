'use strict';

/**
 * product-like service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product-like.product-like');
