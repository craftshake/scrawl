<?php

/**
 * Scrawl is a simple markdown plugin for Craft CMS providing a fieldtype and a twig filter.
 *
 * @package   Craft Scrawl
 * @author    Mario Friz
 */

namespace Craft;

class ScrawlPlugin extends BasePlugin
{

    public function getName()
    {
        return Craft::t('Scrawl');
    }

    public function getVersion()
    {
        return '1.0.1';
    }

    public function getDeveloper()
    {
        return 'Mario Friz';
    }

    public function getDeveloperUrl()
    {
        return 'http://builtbysplash.com';
    }
}
