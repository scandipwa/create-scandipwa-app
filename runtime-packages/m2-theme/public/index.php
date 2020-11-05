<?php
    $colorConfig = $this->getThemeConfiguration('color_customization');
    $contentConfig = $this->getThemeConfiguration('content_customization');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
    
    <script>
        window.actionName = {
            type: `<?= $this->getAction(); ?>`
        };

        window.contentConfiguration = <?= json_encode($contentConfig) ?> || {};
    </script>

    <style>
        <?php if ($colorConfig['enable_color_customization']['enable_custom_colors'] !== "0"): ?>
            <?php $colorArray = $colorConfig['primary_colors'] + $colorConfig['secondary_colors']; ?>
            :root {
                <?php foreach ($colorArray as $code => $color): ?>
                    <?php if (strpos($code, 'color') !== false): ?>
                        <?= sprintf('--imported_%s: #%s;', $code, $color); ?>
                    <?php endif; ?>
                <?php endforeach; ?>
            }
        <?php endif; ?>
    </style>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>
