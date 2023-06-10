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

    function getVitalago() public pure returns (string memory) {
        return vitalago;
    }


}

contract Potato {
    string public constant potato = "iVBORw0KGgoAAAANSUhEUgAAADsAAAA7BAMAAAA3C++AAAAAJFBMVEUAAADNIScTExP9u1X/bABCFxP////2fDv/wADMLzveoVC6ICWAwLh8AAAAAXRSTlMAQObYZgAAAUNJREFUOMvtzz1Ow0AQBeCwJ2BWe4Dd2fwBnaewRLeRC9dGuQBIPoBdpAZRpE6XlnSckrckVJ5NTZGnkZtPb3Y8u+UcvqrGXkNvaDbzJQ7WkDe24NnIYop3BVjQ2GDQT9ZgifKuxwSXPL4qG2JyZHGAela+u0mE1QrDKLg2UfJGZUfU7MH2zmsMYA5Nstqf4er31SjDOhF4muB4rGI94Di1venj8lXqQIn89G1a9m99H09zjQOd+fF7aBqF3aUtQztlQ59u2UfM89e+ITvhttmwVCxSr1Vuo+ScCvwhjES0cbnC1RbpVH6iNi62ObGeTzmQu3BXz6nEzAuVzS93x+OhqxIOnzD98ZDoXuFNXv5weFF258dttWXwKuTd2nYWqeKAssp2FJGdWs7biXcirJZzHc5Q1jTXkZKinp2hJWfgLf88PzJgTBe1TCseAAAAAElFTkSuQmCC";

    function getPotato() public pure returns (string memory) {
        return potato;
    }
}