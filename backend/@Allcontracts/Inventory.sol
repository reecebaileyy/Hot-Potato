// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Backgrounds {
    string public constant background1 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8BAMAAADI0sRBAAAAKlBMVEUAAAAMDA0HBRElTUoycE1DGitDjEZSITNsLzKCqFmGQjzRtpj78Nr////3F57UAAAAAnRSTlMAAHaTzTgAAAJ0SURBVHhe7dQ/btswFAbwJCeIeAJTIux21WOVoRvfA1EPvYRFPEDo5haVD1DAQudCAIEeIPABMmUOUKBrx96lj7IU/0v3Dv04ePjx8aMNg1f/aP4nG5JLdDbmgtVm23Xrv/Ji93XXbfUZX4vsh+93uzR+ybfyedN1u3vhqev2+oQXX97d+7B5kW/y/JVn38TQyvUvmdhwjLHnzzGuLg8vbA1NrIEj2tklG3j/q+I3v/saXC45YZXnuIzMTezBFtbHPj9iZQjMj9jIeiJniWMM+sAFByx/Rsn3J1f4INy7Z1aWCeHxgZkfH9BzSCVhdmASftvI9AdGZvIsOTAQAdheZiIHIhD3XE5c0MDDz+KF0aYCN7FJZwN44eCF0IZTtlQxEnMglE2h5CNWFoiq2GPqEO0Ts0c9sgyTbcQhKTOWnploYhQGLx449iwVpZEamu25ACBnWFKLJdaK6JhBqwToB0Vtmn7iG4tQZkqEwA7usrlcEEcmH1yWzRnT4V5ay+y1sLuamElnCoEDMwChHricmJhynRXWB+m9a1utGuHZxBLvVNsNadt1qo48sfWE1aq42yTdth8xj5Iw8rXxXFtn4a6VfKorXvY+9qvbI4aSALfCVRD+tpSLT1wQByzIovRuPMtKrCdWnsiZmrDbtJ1vAoeqieGIuS7nQbhru3nTc5gzr7JnthzcnjdbI8xm2R84vSnaMJXyzdbKR+aq6d2BUwyhXqSnwzCTk/2nXBCUarPOhn+1k4EzBiizhRa2L7FKrMaa8pxVnng8xwZ9xgYtgh7YBMvlKSuLNLLywu6M6cAcgFfnDAQTI/iRp6g8Zc95ynj1PzvXIzG9J6eDAAAAAElFTkSuQmCC";
    string public constant background2 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8BAMAAADI0sRBAAAAJ1BMVEUAAAAMDA0HBREWGisuOko3CDs9VF9XE0GBJUOuN0bRtpj78Nr///+uf4lfAAAAAnRSTlMAAHaTzTgAAAJxSURBVHhe7dRPjtMwFAbwmTnBxCeoUyKXbVME+0aw9+jJEetRD2Dx9FyJVaXKL1yAWFxgpLnAIHasORTPmYT+G/Ys+LJIlJ/tz4miXP2j+Z9iSCnRxZgLVqt10yz/yvPN+02z1md8nWmYfL/Z5OmXfCvnm6bZ3AtPXbfXJzz/8Ok+xNWLfFOWrwKHLsVatn/JxIZTSj2/S2l3uXjl9tClPXBCN7tkA59/tmx/9XvwpeSEVVniNjF3qQdXuZD68oiVITDfUyfHE3lHnFLUB644ov2RJN+efBWicO//sHJMCI8PzPz4gIFjLomzA5Pwx05mf2FkpsCSAwMRgOtlTuIo1+KB7cQVDTy8liCMLhf4iU1eGyAIxyCELp6yo5aRmCOhDIqWj1g56W5Tj7lDtM/MAfXI5IhcJz4UMKMNzEQTozAE8cipZ6mwRmpo9swVAHnDkr1YZq2Ijhm0yoBhUNSm6ye+cQi2UCIEbnBfLGSDODKF6ItiwZgXD9Jqi9fC/mpiJl0oBI7MAIR6YDsxMZW6qFyI0ntX11p1wrOJJcGruhlS18tcnXhiFwjbXXW3yrqu32CZJHHkaxN477yDu1rydt/ytg+p390eMVgCXAu3UfjrVjY+cUUcsSKH0rsKLEdmPbEKRN7sCZtV3YQucmy7FI+Y93YRhZu6WXQ9xwXzrvjDjqN/5tXaCLPZ9gfO/xRtmKw82VKFxNx2vT9wjiHU8/zrMMzkZfwpVwRWrZbF8FV7uXHGALaYa2H3EqvMaqyx56zKzOM6LuozNugQ9MAmOranrBzSyCoI+zOmA3ME3p0zEEyMEEaeosqcgZ8vx63/BonNWyIQPbgXAAAAAElFTkSuQmCC";
    string public constant background3 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8BAMAAADI0sRBAAAAJ1BMVEUAAAAMDA0HBREWGisuOko3CDs9VF9XE0GBJUOuN0bRtpj78Nr///+uf4lfAAAAAnRSTlMAAHaTzTgAAAJxSURBVHhe7dRPjtMwFAbwmTnBxCeoUyKXbVME+0aw9+jJEetRD2Dx9FyJVaXKL1yAWFxgpLnAIHasORTPmYT+G/Ys+LJIlJ/tz4miXP2j+Z9iSCnRxZgLVqt10yz/yvPN+02z1md8nWmYfL/Z5OmXfCvnm6bZ3AtPXbfXJzz/8Ok+xNWLfFOWrwKHLsVatn/JxIZTSj2/S2l3uXjl9tClPXBCN7tkA59/tmx/9XvwpeSEVVniNjF3qQdXuZD68oiVITDfUyfHE3lHnFLUB644ov2RJN+efBWicO//sHJMCI8PzPz4gIFjLomzA5Pwx05mf2FkpsCSAwMRgOtlTuIo1+KB7cQVDTy8liCMLhf4iU1eGyAIxyCELp6yo5aRmCOhDIqWj1g56W5Tj7lDtM/MAfXI5IhcJz4UMKMNzEQTozAE8cipZ6mwRmpo9swVAHnDkr1YZq2Ijhm0yoBhUNSm6ye+cQi2UCIEbnBfLGSDODKF6ItiwZgXD9Jqi9fC/mpiJl0oBI7MAIR6YDsxMZW6qFyI0ntX11p1wrOJJcGruhlS18tcnXhiFwjbXXW3yrqu32CZJHHkaxN477yDu1rydt/ytg+p390eMVgCXAu3UfjrVjY+cUUcsSKH0rsKLEdmPbEKRN7sCZtV3YQucmy7FI+Y93YRhZu6WXQ9xwXzrvjDjqN/5tXaCLPZ9gfO/xRtmKw82VKFxNx2vT9wjiHU8/zrMMzkZfwpVwRWrZbF8FV7uXHGALaYa2H3EqvMaqyx56zKzOM6LuozNugQ9MAmOranrBzSyCoI+zOmA3ME3p0zEEyMEEaeosqcgZ8vx63/BonNWyIQPbgXAAAAAElFTkSuQmCC";

    function getBackground1() public pure returns (string memory) {
        return background1;
    }

    function getBackground2() public pure returns (string memory) {
        return background2;
    }

    function getBackground3() public pure returns (string memory) {
        return background3;
    }
}

contract Hands {
    string public constant hand1 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8AQMAAAAAMksxAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAA5JREFUeF5jwAFGwSgAAAIcAAGbMYQTAAAAAElFTkSuQmCC";
    string public constant hand2 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8AQMAAAAAMksxAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAA5JREFUeF5jwAFGwSgAAAIcAAGbMYQTAAAAAElFTkSuQmCC";
    string public constant hand3 = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8AQMAAAAAMksxAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAA5JREFUeF5jwAFGwSgAAAIcAAGbMYQTAAAAAElFTkSuQmCC";
    function getHand1() public pure returns (string memory) {
        return hand1;
    }

    function getHand2() public pure returns (string memory) {
        return hand2;
    }

    function getHand3() public pure returns (string memory) {
        return hand3;
    }
}