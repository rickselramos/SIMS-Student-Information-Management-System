<?php
// Dummy JWT functions for now
function validateToken($token) {
    return true; // Skip validation for now
}

function generateToken($user) {
    return base64_encode(json_encode($user));
}