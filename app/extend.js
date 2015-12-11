"use strict";
/**
 * Simple high performance object merge
 */

/**
 * Copies source to target and returns target
 * @param  {Object} target
 * @param  {Object} source
 * @return {Object} merged result
 */
module.exports = function extend(a, b)
{
    for(var key in b)
    {
        if(b.hasOwnProperty(key))
        {
            a[key] = b[key];
        }
    }

    return a;
}