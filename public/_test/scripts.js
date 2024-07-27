$(document).ready(function() {
    $('#connect-wallet').click(function() {
        alert('Connect Wallet button clicked');
    });

    $('#ctx-sell').click(function() {
        const ctxAddr = $('#ctx-addr').val();
        alert('CTX Sell button clicked with address: ' + ctxAddr);
    });

    $('#submit-market').click(function() {
        const usdLpAmount = $('#usd-lp-amount').val();
        const description = $('#description-rules').val();
        const option1 = $('#option1').val();
        const option2 = $('#option2').val();
        const option3 = $('#option3').val();
        alert('Market submitted with options: ' + option1 + ', ' + option2 + ', ' + option3);
    });

    $('#buy-ctx').click(function() {
        const buyCtxAddr = $('#buy-ctx-addr').val();
        const buyCtxAmount = $('#buy-ctx-amount').val();
        alert('Buy CTX clicked with address: ' + buyCtxAddr + ' and amount: ' + buyCtxAmount);
    });

    $('.buy').click(function() {
        alert('Buy button clicked');
    });

    $('.sell').click(function() {
        alert('Sell button clicked');
    });
});
