// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../mocks/ERC1155Mock.sol";
import "../mocks/ERC1155CWPermanentMock.sol";
import "../CreatorTokenNonfungible.t.sol";

contract ERC1155CWPermanentTest is CreatorTokenNonfungibleTest {
    event Staked(uint256 indexed tokenId, address indexed account, uint256 amount);
    event Unstaked(uint256 indexed tokenId, address indexed account, uint256 amount);
    event StakerConstraintsSet(StakerConstraints stakerConstraints);

    ERC1155Mock public wrappedTokenMock;
    ERC1155CWPermanentMock public tokenMock;

    function setUp() public virtual override {
        super.setUp();

        wrappedTokenMock = new ERC1155Mock();
        tokenMock = new ERC1155CWPermanentMock(address(wrappedTokenMock));
    }

    function _deployNewToken(address creator) internal virtual override returns (ITestCreatorToken) {
        vm.startPrank(creator);
        address wrappedToken = address(new ERC1155Mock());
        ITestCreatorToken token = ITestCreatorToken(address(new ERC1155CWPermanentMock(wrappedToken)));
        vm.stopPrank();
        return token;
    }

    function _mintToken(address tokenAddress, address to, uint256 tokenId, uint256 amount) internal virtual override {
        address wrappedTokenAddress = ERC1155CWPermanentMock(tokenAddress).getWrappedCollectionAddress();
        vm.startPrank(to);
        ERC1155Mock(wrappedTokenAddress).mint(to, tokenId, amount);
        ERC1155Mock(wrappedTokenAddress).setApprovalForAll(tokenAddress, true);
        ERC1155CWPermanentMock(tokenAddress).mint(to, tokenId, amount);
        vm.stopPrank();
    }

    function testSupportedTokenInterfaces() public {
        assertEq(tokenMock.supportsInterface(type(ICreatorToken).interfaceId), true);
        assertEq(tokenMock.supportsInterface(type(ICreatorTokenWrapperERC1155).interfaceId), true);
        assertEq(tokenMock.supportsInterface(type(IERC1155).interfaceId), true);
        assertEq(tokenMock.supportsInterface(type(IERC1155MetadataURI).interfaceId), true);
        assertEq(tokenMock.supportsInterface(type(IERC1155Receiver).interfaceId), true);
        assertEq(tokenMock.supportsInterface(type(IERC165).interfaceId), true);
    }

    function testGetTransferValidationFunction() public override {
        (bytes4 functionSignature, bool isViewFunction) = tokenMock.getTransferValidationFunction();

        assertEq(functionSignature, bytes4(keccak256("validateTransfer(address,address,address,uint256,uint256)")));
        assertEq(isViewFunction, false);
    }

    function testCanUnstakeReturnsFalseWhenTokensDoNotExist(uint256 tokenId, uint256 amount) public {
        vm.assume(amount > 0);
        assertFalse(tokenMock.canUnstake(tokenId, amount));
    }

    function testCanUnstakeReturnsFalseForPermanentlyStakedTokens(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToUnstake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 1);
        vm.assume(amountToUnstake > 0);
        vm.assume(amount >= amountToUnstake);
        _mintToken(address(tokenMock), to, tokenId, amount);
        assertFalse(tokenMock.canUnstake(tokenId, amountToUnstake));
    }

    function testCanUnstakeReturnsFalseWhenBalanceOfWrapperTokenIsInsufficient(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToUnstake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 1);
        vm.assume(amountToUnstake > amount);
        _mintToken(address(tokenMock), to, tokenId, amount);
        assertFalse(tokenMock.canUnstake(tokenId, amountToUnstake));
    }

    function testWrappedCollectionHoldersCanStakeTokensGiveSufficientWrappedTokenBalance(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amountToStake);
        vm.stopPrank();

        assertEq(tokenMock.balanceOf(to, tokenId), amountToStake);
        assertEq(wrappedTokenMock.balanceOf(to, tokenId), amount - amountToStake);
        assertEq(wrappedTokenMock.balanceOf(address(tokenMock), tokenId), amountToStake);
    }

    function testRevertsWhenNativeFundsIncludedInStake(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake,
        uint256 value
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);
        vm.assume(value > 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.deal(to, value);
        vm.expectRevert(
            ERC1155WrapperBase.ERC1155WrapperBase__DefaultImplementationOfStakeDoesNotAcceptPayment.selector
        );
        tokenMock.stake{value: value}(tokenId, amountToStake);
        vm.stopPrank();
    }

    function testRevertsWhenUnauthorizedUserAttemptsToStake(
        address to,
        address unauthorizedUser,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(to != unauthorizedUser);
        vm.assume(unauthorizedUser != address(0));
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        vm.startPrank(unauthorizedUser);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__InsufficientBalanceOfWrappedToken.selector);
        tokenMock.stake(tokenId, amountToStake);
        vm.stopPrank();
    }

    function testRevertsWhenApprovedOperatorAttemptsToStake(
        address to,
        address approvedOperator,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(to != approvedOperator);
        vm.assume(approvedOperator != address(0));
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        wrappedTokenMock.setApprovalForAll(approvedOperator, true);
        vm.stopPrank();

        vm.startPrank(approvedOperator);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__InsufficientBalanceOfWrappedToken.selector);
        tokenMock.stake(tokenId, amountToStake);
        vm.stopPrank();
    }

    function testRevertsWhenStakeCalledWithZeroAmount(address to, uint256 tokenId, uint256 amount) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__AmountMustBeGreaterThanZero.selector);
        tokenMock.stake(tokenId, 0);
        vm.stopPrank();
    }

    function testRevertsWhenUnauthorizedUserAttemptsToUnstake(
        address to,
        address unauthorizedUser,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(to != unauthorizedUser);
        vm.assume(unauthorizedUser != address(0));
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amountToStake);
        vm.stopPrank();

        vm.startPrank(unauthorizedUser);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__InsufficientBalanceOfWrappingToken.selector);
        tokenMock.unstake(tokenId, amountToStake);
        vm.stopPrank();
    }

    function testRevertsWhenApprovedOperatorAttemptsToUnstake(
        address to,
        address approvedOperator,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToStake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(to != approvedOperator);
        vm.assume(approvedOperator != address(0));
        vm.assume(amount > 0);
        vm.assume(amountToStake > 0 && amountToStake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        wrappedTokenMock.setApprovalForAll(approvedOperator, true);
        tokenMock.setApprovalForAll(approvedOperator, true);
        tokenMock.stake(tokenId, amountToStake);
        vm.stopPrank();

        vm.startPrank(approvedOperator);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__InsufficientBalanceOfWrappingToken.selector);
        tokenMock.unstake(tokenId, amountToStake);
        vm.stopPrank();
    }

    function testRevertsWhenUserAttemptsToUnstakeATokenAmountThatHasNotBeenStaked(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToUnstake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 1);
        vm.assume(amountToUnstake > amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amount);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__InsufficientBalanceOfWrappingToken.selector);
        tokenMock.unstake(tokenId, amountToUnstake);
        vm.stopPrank();
    }

    function testWrappingCollectionHoldersCannotUnstakeTokensEvenWithSufficientBalance(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToUnstake
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 1);
        vm.assume(amountToUnstake > 0 && amountToUnstake <= amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amount);
        vm.expectRevert(ERC1155CWPermanent.ERC1155CWPermanent__UnstakeIsNotPermitted.selector);
        tokenMock.unstake(tokenId, amountToUnstake);
        vm.stopPrank();
    }

    function testRevertsWhenNativeFundsIncludedInUnstakeCall(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToUnstake,
        uint256 value
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 1);
        vm.assume(amountToUnstake > 0 && amountToUnstake <= amount);
        vm.assume(value > 0);

        vm.deal(to, value);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amount);
        vm.expectRevert(ERC1155CWPermanent.ERC1155CWPermanent__UnstakeIsNotPermitted.selector);
        tokenMock.unstake{value: value}(tokenId, amountToUnstake);
        vm.stopPrank();
    }

    function testRevertsWhenUnstakingZeroAmount(address to, uint256 tokenId, uint256 amount) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amount);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__AmountMustBeGreaterThanZero.selector);
        tokenMock.unstake(tokenId, 0);
        vm.stopPrank();
    }

    function testSecondaryWrappingCollectionHoldersCannotUnstakeTokens(
        address to,
        address secondaryHolder,
        uint256 tokenId,
        uint256 amount,
        uint256 amountToTransfer
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);
        vm.assume(secondaryHolder != address(0));
        vm.assume(secondaryHolder.code.length == 0);
        vm.assume(to != secondaryHolder);
        vm.assume(amount > 1);
        vm.assume(amountToTransfer > 0 && amountToTransfer < amount);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        tokenMock.stake(tokenId, amount);
        tokenMock.safeTransferFrom(to, secondaryHolder, tokenId, amountToTransfer, "");
        vm.stopPrank();

        vm.startPrank(secondaryHolder);
        vm.expectRevert(ERC1155CWPermanent.ERC1155CWPermanent__UnstakeIsNotPermitted.selector);
        tokenMock.unstake(tokenId, amountToTransfer);
        vm.stopPrank();

        vm.startPrank(to);
        vm.expectRevert(ERC1155CWPermanent.ERC1155CWPermanent__UnstakeIsNotPermitted.selector);
        tokenMock.unstake(tokenId, amount - amountToTransfer);
        vm.stopPrank();
    }

    function testCanSetStakerConstraints(uint8 constraintsUint8) public {
        vm.assume(constraintsUint8 <= 2);
        StakerConstraints constraints = StakerConstraints(constraintsUint8);

        vm.expectEmit(false, false, false, true);
        emit StakerConstraintsSet(constraints);
        tokenMock.setStakerConstraints(constraints);
        assertEq(uint8(tokenMock.getStakerConstraints()), uint8(constraints));
    }

    function testRevertsWhenUnauthorizedUserAttemptsToSetStakerConstraints(
        address unauthorizedUser,
        uint8 constraintsUint8
    ) public {
        vm.assume(unauthorizedUser != address(0));
        vm.assume(unauthorizedUser != address(tokenMock));
        vm.assume(unauthorizedUser != address(this));
        vm.assume(constraintsUint8 <= 2);
        StakerConstraints constraints = StakerConstraints(constraintsUint8);

        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        tokenMock.setStakerConstraints(constraints);
    }

    function testEOACanStakeTokensWhenStakerConstraintsAreInEffect(address to, uint256 tokenId, uint256 amount)
        public
    {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to != address(tokenMock));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        tokenMock.setStakerConstraints(StakerConstraints.CallerIsTxOrigin);

        vm.startPrank(to, to);
        tokenMock.stake(tokenId, amount);
        vm.stopPrank();

        assertEq(tokenMock.balanceOf(to, tokenId), amount);
        assertEq(wrappedTokenMock.balanceOf(to, tokenId), 0);
        assertEq(wrappedTokenMock.balanceOf(address(tokenMock), tokenId), amount);
    }

    function testEOACanStakeTokensWhenEOAStakerConstraintsAreInEffectButValidatorIsUnset(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to != address(tokenMock));
        vm.assume(to.code.length == 0);
        vm.assume(amount > 0);

        tokenMock.setTransferValidator(address(0));

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        tokenMock.setStakerConstraints(StakerConstraints.EOA);

        vm.startPrank(to, to);
        tokenMock.stake(tokenId, amount);
        vm.stopPrank();

        assertEq(tokenMock.balanceOf(to, tokenId), amount);
        assertEq(wrappedTokenMock.balanceOf(to, tokenId), 0);
        assertEq(wrappedTokenMock.balanceOf(address(tokenMock), tokenId), amount);
    }

    function testVerifiedEOACanStakeTokensWhenEOAStakerConstraintsAreInEffect(
        uint160 toKey,
        uint256 tokenId,
        uint256 amount
    ) public {
        address to = _verifyEOA(toKey);
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(amount > 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        tokenMock.setStakerConstraints(StakerConstraints.EOA);

        vm.startPrank(to);
        tokenMock.stake(tokenId, amount);
        vm.stopPrank();

        assertEq(tokenMock.balanceOf(to, tokenId), amount);
        assertEq(wrappedTokenMock.balanceOf(to, tokenId), 0);
        assertEq(wrappedTokenMock.balanceOf(address(tokenMock), tokenId), amount);
    }

    function testRevertsWhenCallerIsTxOriginConstraintIsInEffectIfCallerIsNotOrigin(
        address to,
        address origin,
        uint256 tokenId,
        uint256 amount
    ) public {
        _sanitizeAddress(to);
        _sanitizeAddress(origin);
        vm.assume(to != address(0));
        vm.assume(origin != address(0));
        vm.assume(to != origin);
        vm.assume(to.code.length == 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        tokenMock.setStakerConstraints(StakerConstraints.CallerIsTxOrigin);

        vm.prank(to, origin);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__SmartContractsNotPermittedToStake.selector);
        tokenMock.stake(tokenId, amount);
    }

    function testRevertsWhenCallerIsEOAConstraintIsInEffectIfCallerHasNotVerifiedSignature(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public {
        _sanitizeAddress(to);
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0);

        vm.startPrank(to);
        wrappedTokenMock.mint(to, tokenId, amount);
        wrappedTokenMock.setApprovalForAll(address(tokenMock), true);
        vm.stopPrank();

        tokenMock.setStakerConstraints(StakerConstraints.EOA);

        vm.prank(to);
        vm.expectRevert(ERC1155WrapperBase.ERC1155WrapperBase__CallerSignatureNotVerifiedInEOARegistry.selector);
        tokenMock.stake(tokenId, amount);
    }

    function _sanitizeAddress(address addr) internal view virtual override {
        super._sanitizeAddress(addr);
        vm.assume(addr != address(tokenMock));
        vm.assume(addr != address(wrappedTokenMock));
    }
}
