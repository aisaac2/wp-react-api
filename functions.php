<?php

function get_menu() {
  return wp_get_nav_menu_items('menu');
}

add_action( 'rest_api_init', function () {
        register_rest_route( 'wp', 'v2/menu', array(
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_menu',
    ) );
} );
