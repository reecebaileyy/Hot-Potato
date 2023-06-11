// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Backgrounds {
    string public constant blue = "iVBORw0KGgoAAAANSUhEUgAAAV8AAAFfCAMAAADeaz+zAAAAElBMVEXH5c7H5c7H5c7H5c7H5c7H5c4nthzpAAAABXRSTlPAgEAwIFKVw6oAAAAJcEhZcwAACxIAAAsSAdLdfvwAAALaSURBVHic7dBHAQAwEMCg6/JvuSr4BQnM3XHOrBdn+qX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rXmAwfNVmW54Fg+AAAADmVYSWZNTQAqAAAACAAAAAAAAADSU5MAAAAASUVORK5CYII=";
    string public constant purple = "iVBORw0KGgoAAAANSUhEUgAAAV8AAAFfCAMAAADeaz+zAAAAElBMVEW3iL23iL23iL23iL23iL23iL3Zc3roAAAABXRSTlPAgEAwIFKVw6oAAAAJcEhZcwAACxIAAAsSAdLdfvwAAALaSURBVHic7dBHAQAwEMCg6/JvuSr4BQnM3XHOrBdn+qX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rXmAwfNVmW54Fg+AAAADmVYSWZNTQAqAAAACAAAAAAAAADSU5MAAAAASUVORK5CYII=";
    string public constant green = "iVBORw0KGgoAAAANSUhEUgAAAV8AAAFfCAMAAADeaz+zAAAAElBMVEXA1y/A1y/A1y/A1y/A1y/A1y8PwfGOAAAABXRSTlPAgEAwIFKVw6oAAAAJcEhZcwAACxIAAAsSAdLdfvwAAALaSURBVHic7dBHAQAwEMCg6/JvuSr4BQnM3XHOrBdn+qX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rX6tfq1+rXmAwfNVmW54Fg+AAAADmVYSWZNTQAqAAAACAAAAAAAAADSU5MAAAAASUVORK5CYII=";

    function getBlue() public pure returns (string memory) {
        return blue;
    }

    function getPurple() public pure returns (string memory) {
        return purple;
    }

    function getGreen() public pure returns (string memory) {
        return green;
    }
}

contract Hands {
    string public constant skin_tone_4 = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7AgMAAAC4SxogAAAADFBMVEUAAABnRjNULxk1GiAr7rgXAAAAAXRSTlMAQObYZgAAAUZJREFUKM/tzjFLw1AQAOCDzI2/JoIu/opLaBKfUxHSWro42P8R3qB0y5DYapZXqC6B/IY8kM6x1EFcXMTBy8t7SYf+BA/e3X3vODj4D4oTel8H/P6Fi6v+w5Fb2PGws6w4SI8bWu42BGcXF9qDICDX9cx4PA6g3u+NndXNqpzfzUPjzVqUbDHtLTbllHU+FeKlfGLsofcrfBpbhRRiXS4Y41bROJdiTV4wbjce5LKSsuTc4/ascSjjiJy63FEOMMF7eEcf62O2PBziGPY4wqpojfEEzlzUxjcfyZhcY+stKuOu84g87DzU85E23ipfojJU5CWckz04YuoQc7ApL5XtWNvNjamjbJwmfgFW4ketB1ESkVM/nRk/U/k5cN6s9c6UM20nytTdWRpqP6r6oV119rSX7d3G2UTVs0zZwlQ7wuK49X7jP49AvI+9+0e9AAAAAElFTkSuQmCC";
    string public constant skin_tone_3 = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7AgMAAAC4SxogAAAADFBMVEUAAACicEt9SCI1GiBpALqlAAAAAXRSTlMAQObYZgAAAUZJREFUKM/tzjFLw1AQAOCDzI2/JoIu/opLaBKfUxHSWro42P8R3qB0y5DYapZXqC6B/IY8kM6x1EFcXMTBy8t7SYf+BA/e3X3vODj4D4oTel8H/P6Fi6v+w5Fb2PGws6w4SI8bWu42BGcXF9qDICDX9cx4PA6g3u+NndXNqpzfzUPjzVqUbDHtLTbllHU+FeKlfGLsofcrfBpbhRRiXS4Y41bROJdiTV4wbjce5LKSsuTc4/ascSjjiJy63FEOMMF7eEcf62O2PBziGPY4wqpojfEEzlzUxjcfyZhcY+stKuOu84g87DzU85E23ipfojJU5CWckz04YuoQc7ApL5XtWNvNjamjbJwmfgFW4ketB1ESkVM/nRk/U/k5cN6s9c6UM20nytTdWRpqP6r6oV119rSX7d3G2UTVs0zZwlQ7wuK49X7jP49AvI+9+0e9AAAAAElFTkSuQmCC";
    string public constant skin_tone_2 = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7AgMAAAC4SxogAAAADFBMVEUAAADVpIS5hWM1GiD9lMytAAAAAXRSTlMAQObYZgAAAUZJREFUKM/tzjFLw1AQAOCDzI2/JoIu/opLaBKfUxHSWro42P8R3qB0y5DYapZXqC6B/IY8kM6x1EFcXMTBy8t7SYf+BA/e3X3vODj4D4oTel8H/P6Fi6v+w5Fb2PGws6w4SI8bWu42BGcXF9qDICDX9cx4PA6g3u+NndXNqpzfzUPjzVqUbDHtLTbllHU+FeKlfGLsofcrfBpbhRRiXS4Y41bROJdiTV4wbjce5LKSsuTc4/ascSjjiJy63FEOMMF7eEcf62O2PBziGPY4wqpojfEEzlzUxjcfyZhcY+stKuOu84g87DzU85E23ipfojJU5CWckz04YuoQc7ApL5XtWNvNjamjbJwmfgFW4ketB1ESkVM/nRk/U/k5cN6s9c6UM20nytTdWRpqP6r6oV119rSX7d3G2UTVs0zZwlQ7wuK49X7jP49AvI+9+0e9AAAAAElFTkSuQmCC";
    string public constant skin_tone_1 = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAD1BMVEUAAAD23bnlvYI1GiD44cDJTsFJAAAAAXRSTlMAQObYZgAAAUFJREFUOMvt09FtxCAMBmAkJvjtW8CmA9hkguv+QxWX4xICD/feEiHbfDIQRUn/48+OY4QtHjgspdzCsWqGf3tJqfIXwxZ2cghHBAuvzeTlGZs/KsvS7ijtCUZtDy97FypoZzeUKjfOUCdXt8zKwgq7cZFotxzNVHfcpuVGG6aGKGpZG6PKluNqC2dL3pksS2duq4NLZ+osnetgD3a0GczC4GAeDHMSkHbWlgpnnFwABSBxNcJvUT/lDA4DKDgiAIdN3JysFRI6M1ygGNxSYkxcgJOBujINloUhczdhZvCVHRdO/mIN1hdz+pBjKUaJovZcL1+8yp0p8pmps6ysomO/HBnplZ1UQYMFqsJ31vF/65bL+6gd68k6c0awvctg2Mzl8iIz+455Zjs531mVriyqJ+cnVGYmxcNGhR1j4vnswT99dUxO76btDgAAAABJRU5ErkJggg==";
    string public constant bubble_gum = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAD1BMVEUAAAD8uvr6i/Y1GiD/5P6+vso5AAAAAXRSTlMAQObYZgAAAYtJREFUOMvt042tpDAMBOBIqWDsbcB2A7FDA4jrv6Zz4PL4WTq4F2lF4o/RILGU3/Xfrj4vr9g/vZVS+9pfbqirk1spwcJoX7yQQ7gUJ7Bs3+HMjlRF5j/tGV71ZMX2ZIowjG6EmTy4QjubLq1uGt710x5sYmGfVtewoMAL56/VpBemRJi2qskIeeXxaF9cW1kOplZlZ91yOtnKwgMPlmTfSkxerDgbG/lglvCdt8mf5uQIPVgNLFzXH85aKOA+npx5PwSezDJY/cGxZgACULRq45pHh115OPVSuqTeOQ8CZaLxQkVcQYwbZ/vJ2fzCfLB/M8uoOzgF5Pj8sOdgDA8GZAy2yXVnAnSwTv55aTvzyb7z1BI6micfRWoXFowVg23f0pVD99HBsu/t5JpxBezgADTDl7+Ts2oG6ti3EKg6lyuTYrZFbuXGC1Nc2R5MXdUmh2qXC9c/pDma3PNw/Ybrmmx1cos7Ly+M7WQkt/Lv/lrqk1Xp+lWJKvishsqdSfFTXvHGuLFeWSf/BZRrWoz6vHg4AAAAAElFTkSuQmCC";
    string public constant green_slime = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAD1BMVEUAAAB76FBawTE1GiDN/rkecFBxAAAAAXRSTlMAQObYZgAAAYtJREFUOMvt042tpDAMBOBIqWDsbcB2A7FDA4jrv6Zz4PL4WTq4F2lF4o/RILGU3/Xfrj4vr9g/vZVS+9pfbqirk1spwcJoX7yQQ7gUJ7Bs3+HMjlRF5j/tGV71ZMX2ZIowjG6EmTy4QjubLq1uGt710x5sYmGfVtewoMAL56/VpBemRJi2qskIeeXxaF9cW1kOplZlZ91yOtnKwgMPlmTfSkxerDgbG/lglvCdt8mf5uQIPVgNLFzXH85aKOA+npx5PwSezDJY/cGxZgACULRq45pHh115OPVSuqTeOQ8CZaLxQkVcQYwbZ/vJ2fzCfLB/M8uoOzgF5Pj8sOdgDA8GZAy2yXVnAnSwTv55aTvzyb7z1BI6micfRWoXFowVg23f0pVD99HBsu/t5JpxBezgADTDl7+Ts2oG6ti3EKg6lyuTYrZFbuXGC1Nc2R5MXdUmh2qXC9c/pDma3PNw/Ybrmmx1cos7Ly+M7WQkt/Lv/lrqk1Xp+lWJKvishsqdSfFTXvHGuLFeWSf/BZRrWoz6vHg4AAAAAElFTkSuQmCC";
    string public constant blue_slime = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAD1BMVEUAAACE1f9Apuc1GiDm9v/baebNAAAAAXRSTlMAQObYZgAAAYtJREFUOMvt042tpDAMBOBIqWDsbcB2A7FDA4jrv6Zz4PL4WTq4F2lF4o/RILGU3/Xfrj4vr9g/vZVS+9pfbqirk1spwcJoX7yQQ7gUJ7Bs3+HMjlRF5j/tGV71ZMX2ZIowjG6EmTy4QjubLq1uGt710x5sYmGfVtewoMAL56/VpBemRJi2qskIeeXxaF9cW1kOplZlZ91yOtnKwgMPlmTfSkxerDgbG/lglvCdt8mf5uQIPVgNLFzXH85aKOA+npx5PwSezDJY/cGxZgACULRq45pHh115OPVSuqTeOQ8CZaLxQkVcQYwbZ/vJ2fzCfLB/M8uoOzgF5Pj8sOdgDA8GZAy2yXVnAnSwTv55aTvzyb7z1BI6micfRWoXFowVg23f0pVD99HBsu/t5JpxBezgADTDl7+Ts2oG6ti3EKg6lyuTYrZFbuXGC1Nc2R5MXdUmh2qXC9c/pDma3PNw/Ybrmmx1cos7Ly+M7WQkt/Lv/lrqk1Xp+lWJKvishsqdSfFTXvHGuLFeWSf/BZRrWoz6vHg4AAAAAElFTkSuQmCC";
    string public constant vitalago = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAElBMVEUAAACDWkRULxk1GiDNlXqvdlGHJAhEAAAAAXRSTlMAQObYZgAAAXdJREFUOMvt0+Ft9CAMBmAkJnjNfQNgev9N7joAd3SAT032X6V2Iy4hQV2gJYowebCdIMX9jV87bm0a4g03cc7rNNjgkSkn56YQA+TEiojBZuiGc7LmQizQ/FN6RkJjvY7pd0qUoL0V43Ss7itrc87iA2trhhz4M1q6eEumacRIUbzSgD8UkVg8K2uFIdurndiLuz++mcTHlYM+bZxcJsOVbcPb002Ns3GG3sZ25sE4NIZkiiBemTWcnx4bJ4ABRHs1AsC1TmN+fwC41rKx1jEDyHguoEstGdKx+j/RxVwIPRfkaNU/VtbwEbCx7k0ALo2BqeNqTCu/IZ64xFe2RSB0XBH2nLFjd18ZizGXlYM78tX4Wo/slwobyRbvtVjM0tSO6shkcRvTf1Naea4n5sitnnYqTLznTMygxnNhjuHI3P7vZcjp1QoD5o25Zw9jeS2NIT2n3Yf0nEf87Fk29kfm5bHnyLyxR13mnolRpa0uP3NV7ns3/gKJSV3BEeeLpQAAAABJRU5ErkJggg==";
    string public constant green_goblin = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAElBMVEUAAABgozg6Zx81GiB3tlJMMDZb9RaRAAAAAXRSTlMAQObYZgAAAXZJREFUOMvt0uGRhCAMBWBnqOCFbSChASJrAY4lONt/KxcQEVyvgZvTH/D4BoPR6f/6s1eqo4uPuk/JIEW3xwdd9vTZJ/exIX25g1cstrwoEvydFQFl1dnAiKO6FTMQ8oxBim3kd15DdDFNNs54xRuLguJi92zMI7uVAoPSJy57LiLYBgblVUqTmz3n4B8YwU72yKKAFobm4o3TyR4H+8Jn8xdzzRxAlu25bIw4uSWzQyxMjeVg9UfdYK9tpmfX8gNe0XFlim8I5GIm4xmVEVYQe/DBNhNg48p8MCClk1a3cphKBhQggA4uc2iJtZplvphRD1oZDAH8Ec0YjJHRuEy/mBr7kVG45vJRCvvKq1HPNW7tT3riVxyZap5v7KRtvrZTjaWP3yxxZIot3llYgJYVxNKxksiwO+cby8U8sEOOYWq5sB9YOhbp+V3YX5yjtaVnttTO0rNbHxlbz+iZRhYhdLVBJHzyGxC+MYxrcf2F0bGMzJV/ALVoUi4pG0jdAAAAAElFTkSuQmCC";
    string public constant brown_goblin = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAElBMVEUAAACna1lyQDA1GiDJkoJMMDZzNdbsAAAAAXRSTlMAQObYZgAAAXZJREFUOMvt0uGRhCAMBWBnqOCFbSChASJrAY4lONt/KxcQEVyvgZvTH/D4BoPR6f/6s1eqo4uPuk/JIEW3xwdd9vTZJ/exIX25g1cstrwoEvydFQFl1dnAiKO6FTMQ8oxBim3kd15DdDFNNs54xRuLguJi92zMI7uVAoPSJy57LiLYBgblVUqTmz3n4B8YwU72yKKAFobm4o3TyR4H+8Jn8xdzzRxAlu25bIw4uSWzQyxMjeVg9UfdYK9tpmfX8gNe0XFlim8I5GIm4xmVEVYQe/DBNhNg48p8MCClk1a3cphKBhQggA4uc2iJtZplvphRD1oZDAH8Ec0YjJHRuEy/mBr7kVG45vJRCvvKq1HPNW7tT3riVxyZap5v7KRtvrZTjaWP3yxxZIot3llYgJYVxNKxksiwO+cby8U8sEOOYWq5sB9YOhbp+V3YX5yjtaVnttTO0rNbHxlbz+iZRhYhdLVBJHzyGxC+MYxrcf2F0bGMzJV/ALVoUi4pG0jdAAAAAElFTkSuQmCC";
    string public constant yellow_goblin = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAElBMVEUAAACnpllzcjY1GiDGxXxMMDb9ZLDLAAAAAXRSTlMAQObYZgAAAXZJREFUOMvt0uGRhCAMBWBnqOCFbSChASJrAY4lONt/KxcQEVyvgZvTH/D4BoPR6f/6s1eqo4uPuk/JIEW3xwdd9vTZJ/exIX25g1cstrwoEvydFQFl1dnAiKO6FTMQ8oxBim3kd15DdDFNNs54xRuLguJi92zMI7uVAoPSJy57LiLYBgblVUqTmz3n4B8YwU72yKKAFobm4o3TyR4H+8Jn8xdzzRxAlu25bIw4uSWzQyxMjeVg9UfdYK9tpmfX8gNe0XFlim8I5GIm4xmVEVYQe/DBNhNg48p8MCClk1a3cphKBhQggA4uc2iJtZplvphRD1oZDAH8Ec0YjJHRuEy/mBr7kVG45vJRCvvKq1HPNW7tT3riVxyZap5v7KRtvrZTjaWP3yxxZIot3llYgJYVxNKxksiwO+cby8U8sEOOYWq5sB9YOhbp+V3YX5yjtaVnttTO0rNbHxlbz+iZRhYhdLVBJHzyGxC+MYxrcf2F0bGMzJV/ALVoUi4pG0jdAAAAAElFTkSuQmCC";
    string public constant sully = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAGFBMVEUAAABV2dE1GiArjYfPg9ikVa1/8erdmuXBXYPcAAAAAXRSTlMAQObYZgAAAfVJREFUOMvtklFy2yAQhjXcYBfHfQUhq8+wuYAVPH2Oxz6AdYNmev/pvyggRfENWvSghY9vYYHuf/tnW19/T2H/6F3Xmf7YP5lgHqP1qesCx/novuGRiUgxfn7+JhNcchrAp73uKVHF+HiPbbJpSR5iiLzfmHjrZXRmFo4su82NyKy6M5A1+7zbmceXrDOAjM99xbowecVMuvwznBh7DHtsXDfar8njjNGKk3mobf2LM+8c1T66UDGOelCb6eLMjbzaEw6/YnLDWyQrXjELwtfJ0IpTPgsRxWvXnSwCOeTQ8AhMBevaBRPw3M6EPNh6oZjBRK7i3+gU7tApFMKPin9mtQXjakeEauePav8hLr5VOxbX06+tzYD0ovidIvDWPtPSshaWPzsHV/EDvRkDF7VvmDxi4Oha3YyeJ74rviPAfL/W7X0pNJ80+TUrI+Zq48qW1RZ72UloFLddqhkgQ59KjbjxZhfc1l7wanch+Ugc0mdMVuO1DUGESIpgNJI0NYhTnUSfw2KXcChn2o7VCkta7CBeYv7Y2EMWkeBqmejkyW3k/CZJcy/Zg7xm6OvaWWm1lWes3XJDprA9ROiT2+bubas0xB5481p6FJNWO6CyvmUfmSThKbR2ykHIz+01eDmc7qt9v56F23sYieJ02dq3wRKp/Recw2f/wsP1CQAAAABJRU5ErkJggg==";
    string public constant tiger = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAGFBMVEUAAAD7iws1GiDKXgBjJQNFGQH/uGeAMwrO0BFlAAAAAXRSTlMAQObYZgAAAh5JREFUOMvtkkFynDAQRSlu8FvKrCUEeC3JPgBYk6yDRwcYKidw5f6VbjFo8Ng3iMUCNY+v/t2t5nv9t6urr69gd+1M07Tdqfvih/Y6KhuaxpFfT+YTHmkCBAParp/Ek+oD5HC42etHeT+FFCbB2iWn5wdsz0GFSQ7XzrsLPRqLVvVvo2nXl9lTfDA3IoDlMC1YDIf1oxqWn/DDtL8diB/zEb9yYtizaS8ETv/8gM9iPBB7dGL9Yg7MNE/Kok9Bmda7NIP8O3/dcWivSqxZyU1izZ+M2zG32rLaEiS3vMkTN3/HML3yUHFTR976ucUdhzRFAF66pgBEnVzFTwhAwWKtYMDhvU4Llhn2gUIBBF2d/yVAeBlooYD9teNRT7YcqETty5b0tNZxgYpeidoXrUUd2hPnJoY79pBYV2sJ29JL0wzTLUh3a8xXAGdRXwCMTO/WME84WVAUHHlzhe5RrbERiDcnzgMAicnUiQaUtam3vau0GVWppl8kGOZSo18Pd6VgyqLOtuDjfRkW60FuUwcLRQPv6+qHGLfUW/IYl7lCLnzOch2CBC7yNve1bGlrOmeKYVO7aPMlvR/UFjlnZ/YyOQAdCgPUy5KXm888vHngUNiEGMrZt9NdhDaV9uk1wh2bGJ/TvMd9YmedCjt2vmNvad7//iPhclcP8vvPOlBCXtJyaGIaMuxar5rl1PGujpyccDK1Lk+S+p7cqq2yf/2xbAxqJzj+AAAAAElFTkSuQmCC";
    string public constant snow_tiger = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAGFBMVEUAAADe2tI1GiC3r6FwaV5OSUDy7+m3safbVQ7aAAAAAXRSTlMAQObYZgAAAfhJREFUOMvtkkGS2yAQRVXcoBuPswUhK2vouYA1uLIel30Aa5H9pOb+ld/ICI/GN0jQQg2P19BA97/9s62vv6ewv/Wu60y/759MMLfR+tR1geO8d9/wyESkGD8/f5MJLjkN4NNW95SoYny8xTbZtCQPMUTebky89TI6MwtHls3mRmRW3RnImn3e7MzjS9YZQMbnvmJdmLxiJl3+GU6MPYYtNq4b7dfkccZoxcnc1Lb+xZl3jmrvXagYRz2ozXRy5kJe7QmHXzG54S2SFZ+BWRC+ToYaTvkoRPRx7rqDRSC7HFY8ApPiqGsXTLmdjCHyYO1CMYOJXMUf6BTu0CkUwo+Kf2a1BeNqR4Rq5z/V/iQuvlU7FtfTr0ebAelF8TtF4Ef7SEvLWli+d3au4ht6MwZOal8wecTA74pHLWPvia+Krwgw37e6vS+F5oMmP2dlxFxtXNmy2mIvOwkrxW2XagbI0KdSI258tQtuaxfc7C4kH4lDusdkNW5tCCJEUgSjkaSpUfM5iT6HxS7hUM50PVYrLGmxg3iJONJmD1lEgqtlopMn9yDnN0mae8ke5DVDb2tnpdVWntvaZoBM4fEQoWv2lru3qeIQ+5Zdc/coJjU7oLJ+zT4yScrnSvVJBCE/r6/By+5wbfb1fBSmvbvbRHE6PdqXwRKp/RcXe2iOMyBHUwAAAABJRU5ErkJggg==";
    string public constant skeleton = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAD1BMVEUAAAA1GiDn7O+uu8L///8nu3rwAAAAAXRSTlMAQObYZgAAAXpJREFUOMvt08t17CAMAFDRgT40IOEGBK8B/NJ/TYFxPHziTdaJN2PpHjESR4a/59c+tPzsGDwgQEBB+q7hP3tUAK6i//AbRzU/HUAOMa67htMTp3541iwH7sw8WHVndvZTAwDyISq6FSehSCoYnKmSZ9y4FffT+9mt/IndeucmD2zckDurmKg9sffOZeeAEF98Dfbi2rI3V4iFdczNWlrq5qgQKPlgyYTwvll2iImQgvdI2gvlCqKD21h0Cr7+yg9qo+0cE1/VmuvCISF7w/PiZlk0ZNw4XYfnH7K77WwiN4M8sY8Lf2LDZc9Yb2Zd961JG2twH40VVo43143FjT0NzqImPm2xae/tinpnLYHzspDOzNR0YkLSE7+CgynQzPGjAqWbM/XEzGeiQnfUXvOxsFlJ/h4kF7ONbWZbOZytHN9RK14/YeLiI5KiNCPCMkl4JaZLvYNRID5/+4UWLSo6OPHV2ehNs07bEi3NnK2KTZsarqnH5Hht6icPfkqThd1TewAAAABJRU5ErkJggg==";
    string public constant lego = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAGFBMVEUAAADpKSk1GiD91wP/8Jz6d3fcvxzOICD6RWJSAAAAAXRSTlMAQObYZgAAAQhJREFUOMvtkbFtxDAMRYNsoCK4Vvdp3ACicQOcvECKLKDCA1yT9UOKsCgLSWBc7d/4f74PUbDeTp06dUjvcZygDxRbC7uJjVP7uu1xO4XiiHXq2O1hvC3MsbO++hf8KI7ZqlBsdkqOZxtiShGMavOtx5wALFmxWaYOP4h5XjjdIkHdwuAO5yScQfdIM6rlHa4nMivO1Q7YJNj8S7js/KZJ95FjAHKQP2gmQSQjrTLu6yo/16X1tXCp1SRVIHY0hAAUjvZ8CdcQnv5iQXUBLAnU+NxwjdL3tuo7bvjDs7cvjj89a2zYDhNsp1v88jhka484/IOvI5bsy/VmB7DfvGFrj9iX283+xj/hZ1UYEzKkPAAAAABJRU5ErkJggg==";
    string public constant zombie = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAFVBMVEUAAAC5tJQ1GiCWj2vOyq+QQD+ubm5a+ZWUAAAAAXRSTlMAQObYZgAAAXlJREFUOMvt0+2NpDAMBuDIHbzxFJAEuP+OKwBtBUg7Bax0138JZw8DhI+7BnaNEAlP3iQgCD/1bas0lyuWsaQQqHyUmwGEnnMNoYsyIV3YEBJDyIwo8RIeLespguUf53hGxcp2TGfmyhW2tqF059kJmjlrn2hSW1of6cRVPJ7Iw9zhhu1MZHTDbIiqidTYZrhl39od54U5kSw8BUon5oXFOYbuwBl2OkeJiM6xZQHrwmpNiYSNqQAKQHxrDO+0L/bXnP/D9JwnM4CdM+Aj8iOtPPQR7pysM2eGMzaObooXh2EeFRyx8whU4M30mYHuyvzm3/2LHy3Lnv5jzDgy4sZfIzIaDv2b9cUznJvPLbc89GcmxauqdwqAZehWnezcwYtrODMvLFdW0XU+8hbX1HBmVfDKAtXhwrr+33rLdVvqjnVnPTLBeN8MOc9HrqV9kPr51cwN9uEtP49cn+1ix3QPPbLosPdpvDDXYW5ZhiPrVNI/WVnx4Tf+Am1JVTR0bWjRAAAAAElFTkSuQmCC";



    function getHand1() public pure returns (string memory) {
        return skin_tone_1;
    }

    function getHand2() public pure returns (string memory) {
        return skin_tone_2;
    }

    function getHand3() public pure returns (string memory) {
        return skin_tone_3;
    }

    function getHand4() public pure returns (string memory) {
        return skin_tone_4;
    }

    function getBubbleGum() public pure returns (string memory) {
        return bubble_gum;
    }

    function getGreenSlime() public pure returns (string memory) {
        return green_slime;
    }

    function getBlueSlime() public pure returns (string memory) {
        return blue_slime;
    }

    function getVitalago() public pure returns (string memory) {
        return vitalago;
    }

    function getGreenGoblin() public pure returns (string memory) {
        return green_goblin;
    }

    function getBrownGoblin() public pure returns (string memory) {
        return brown_goblin;
    }

    function getYellowGoblin() public pure returns (string memory) {
        return yellow_goblin;
    }

    function getSully() public pure returns (string memory) {
        return sully;
    }

    function getTiger() public pure returns (string memory) {
        return tiger;
    }

    function getSnowTiger() public pure returns (string memory) {
        return snow_tiger;
    }

    function getSkeleton() public pure returns (string memory) {
        return skeleton; //29
    }

    function getLego() public pure returns (string memory) {
        return lego; //27
    }

    function getZombie() public pure returns (string memory) {
        return zombie; //23
    }
}

contract Potato {
    string public constant potato = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAJFBMVEUAAADNIScTExP9u1X/bABCFxP////2fDv/wADMLzveoVC6ICWAwLh8AAAAAXRSTlMAQObYZgAAAUNJREFUOMvtzz1Ow0AQBeCwJ2BWe4Dd2fwBnaewRLeRC9dGuQBIPoBdpAZRpE6XlnSckrckVJ5NTZGnkZtPb3Y8u+UcvqrGXkNvaDbzJQ7WkDe24NnIYop3BVjQ2GDQT9ZgifKuxwSXPL4qG2JyZHGAela+u0mE1QrDKLg2UfJGZUfU7MH2zmsMYA5Nstqf4er31SjDOhF4muB4rGI94Di1venj8lXqQIn89G1a9m99H09zjQOd+fF7aBqF3aUtQztlQ59u2UfM89e+ITvhttmwVCxSr1Vuo+ScCvwhjES0cbnC1RbpVH6iNi62ObGeTzmQu3BXz6nEzAuVzS93x+OhqxIOnzD98ZDoXuFNXv5weFF258dttWXwKuTd2nYWqeKAssp2FJGdWs7biXcirJZzHc5Q1jTXkZKinp2hJWfgLf88PzJgTBe1TCseAAAAAElFTkSuQmCC";

    function getPotato() public pure returns (string memory) {
        return potato;
    }
}