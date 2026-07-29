import { extension_settings } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

const extensionName = 'cut';
const defaultSettings = {
    enabled: true,
    module1: {
        hideTutorials: true,      // 1. 问号图标引导及教程类
        hideLanguageSelect: true, // 2. 语言选择设置框
        hideRedirectLinks: true,  // 3. 三连跳转链接 (Docs / GitHub / Discord)
        hideSliderTips: true,     // 4. 隐藏滑块手动输入提示 (#clickSlidersTips)
        hideCcInvalid: true,      // 5. 隐藏 Chat Completion 无效设置及提示
    },
    module2: {
        foldPresets: true,        // 1. 预设界面折叠生成参数 (四字折叠条标题：预设参数)
        foldWorldInfoTop: true,   // 2. 折叠世界书顶部区域 (#wiTopBlock) (四字折叠条标题：全局世界书)
        foldPersonaSettings: true,// 3. 折叠用户设定高级参数 (四字折叠条标题：设定设置)
        foldUiEffects: true,      // 4. 折叠用户设置：界面效果 (四字折叠条标题：界面效果)
        foldThemeToggles: true,   // 5. 折叠用户设置：主题开关 (四字折叠条标题：主题开关)
        foldUserAdvanced: true,   // 6. 折叠用户设置：高级设置 (四字折叠条标题：高级设置)
        foldCustomCss: true,      // 7. 折叠用户设置：自定义样式 (四字折叠条标题：自定义样式)
        personaHeight450: true,   // 8. 用户设定概述输入框默认 450px (#persona_description)
        customCssHeight500: true, // 9. 自定义 CSS 编辑框默认高度 500px (#customCSS)
    },
};

/**
 * Ensures settings object is populated with default values
 */
function loadSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = {};
    }

    // Merge default settings
    extension_settings[extensionName] = Object.assign({}, defaultSettings, extension_settings[extensionName]);
    
    if (!extension_settings[extensionName].module1) {
        extension_settings[extensionName].module1 = Object.assign({}, defaultSettings.module1);
    } else {
        extension_settings[extensionName].module1 = Object.assign({}, defaultSettings.module1, extension_settings[extensionName].module1);
    }

    if (!extension_settings[extensionName].module2) {
        extension_settings[extensionName].module2 = Object.assign({}, defaultSettings.module2);
    } else {
        extension_settings[extensionName].module2 = Object.assign({}, defaultSettings.module2, extension_settings[extensionName].module2);
    }
}

/**
 * Applies Module 2 folding DOM manipulations
 * Feature 1: Presets Parameter Folding ("预设参数")
 * Feature 2: World Info Top Folding ("全局世界书" - #wiTopBlock)
 * Feature 3: Persona Management Folding ("设定设置" - 插入位置, 链接, 全局设置)
 * Feature 4: User Settings -> "界面效果" (Avatars, Chat/Media Style, Notifications)
 * Feature 5: User Settings -> "主题开关" (Chat Width/Font Scale sliders + Theme Toggles)
 * Feature 6: User Settings -> "高级设置" (FULL COLLECTION of Column 2 AND Column 3, excluding CustomCSS)
 * Feature 7: User Settings -> "自定义样式" (#CustomCSS-block -> "自定义样式" right below "界面效果")
 */
function applyModule2Settings() {
    const settings = extension_settings[extensionName];
    const isMasterEnabled = settings && settings.enabled;
    const isModule2Enabled = isMasterEnabled && settings.module2;

    // --- Feature 1: Fold Presets (#ai_response_configuration) ---
    const shouldFoldPresets = isModule2Enabled && settings.module2.foldPresets;
    const $aiConfig = $('#ai_response_configuration');
    const $presetsBlock = $('#respective-presets-block');

    if ($aiConfig.length > 0 && $presetsBlock.length > 0) {
        let $drawer = $('#cut_m2_gen_params_drawer');
        const $promptManager = $('#completion_prompt_manager').closest('.range-block, #completion_prompt_manager');

        if (shouldFoldPresets) {
            if ($drawer.length === 0) {
                const drawerHtml = `
                <div id="cut_m2_gen_params_drawer" class="inline-drawer wide100p">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>预设参数</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                $presetsBlock.after(drawerHtml);
                $drawer = $('#cut_m2_gen_params_drawer');
            }

            const $drawerContent = $drawer.find('>.inline-drawer-content');
            const $presetItems = $('#common-gen-settings-block, #respective-ranges-and-temps, #advanced-ai-config-block, #kobold_api-settings, #novel_api-settings');
            if ($presetItems.length > 0) {
                $drawerContent.append($presetItems);
            }
            if ($promptManager.length > 0) {
                $drawer.after($promptManager);
            }
            $drawer.show();
        } else {
            if ($drawer.length > 0) {
                const $presetItems = $drawer.find('#common-gen-settings-block, #respective-ranges-and-temps, #advanced-ai-config-block, #kobold_api-settings, #novel_api-settings');
                if ($presetItems.length > 0) {
                    $presetsBlock.after($presetItems);
                }
                if ($promptManager.length > 0 && $('#range_block_openai').length > 0) {
                    $('#range_block_openai').append($promptManager);
                }
                $drawer.hide();
            }
        }
    }

    // --- Feature 2: Fold World Info Top (#wiTopBlock) ---
    const shouldFoldWITop = isModule2Enabled && settings.module2.foldWorldInfoTop;
    const $wiHolder = $('#wi-holder');
    const $wiTopBlock = $('#wiTopBlock');

    if ($wiHolder.length > 0 && $wiTopBlock.length > 0) {
        let $wiDrawer = $('#cut_m2_wi_top_drawer');

        if (shouldFoldWITop) {
            if ($wiDrawer.length === 0) {
                const wiDrawerHtml = `
                <div id="cut_m2_wi_top_drawer" class="inline-drawer wide100p">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>全局世界书</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                $wiHolder.prepend(wiDrawerHtml);
                $wiDrawer = $('#cut_m2_wi_top_drawer');
            }

            const $wiDrawerContent = $wiDrawer.find('>.inline-drawer-content');
            if ($wiDrawerContent.find('#wiTopBlock').length === 0) {
                $wiDrawerContent.append($wiTopBlock);
            }
            $wiDrawer.show();
        } else {
            if ($wiDrawer.length > 0) {
                if ($wiDrawer.find('#wiTopBlock').length > 0) {
                    $wiHolder.prepend($wiTopBlock);
                }
                $wiDrawer.hide();
            }
        }
    }

    // --- Feature 3: Fold Persona Management Settings (插入位置, 链接, 全局设置 -> "设定设置" 4-character drawer) ---
    const shouldFoldPersona = isModule2Enabled && settings.module2.foldPersonaSettings;
    const $personaRightCol = $('.persona_management_right_column');

    if ($personaRightCol.length > 0) {
        let $personaDrawer = $('#cut_m2_persona_drawer');

        const $posHeader = $personaRightCol.find('h4[data-i18n="Position"]').closest('.flex-container');
        const $connHeader = $personaRightCol.find('h4[data-i18n="Connections"]');
        const $otherPersonaBlocks = $personaRightCol.find('.persona_management_description_position_container, #persona_depth_position_settings, #persona_connections_buttons, #persona_connections_info_block, #persona_connections_list, .persona_management_global_settings');

        const $personaElements = $posHeader.add($connHeader).add($otherPersonaBlocks);

        if (shouldFoldPersona) {
            if ($personaDrawer.length === 0) {
                const personaDrawerHtml = `
                <div id="cut_m2_persona_drawer" class="inline-drawer wide100p">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>设定设置</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                $personaRightCol.append(personaDrawerHtml);
                $personaDrawer = $('#cut_m2_persona_drawer');
            }

            const $personaDrawerContent = $personaDrawer.find('>.inline-drawer-content');
            if ($personaElements.length > 0) {
                $personaDrawerContent.append($personaElements);
            }
            $personaDrawer.show();
        } else {
            if ($personaDrawer.length > 0) {
                if ($personaElements.length > 0) {
                    $personaRightCol.append($personaElements);
                }
                $personaDrawer.hide();
            }
        }
    }

    // --- Feature 4: User Settings -> "界面效果" (AvatarAndChatDisplay) ---
    const shouldFoldUiEffects = isModule2Enabled && settings.module2.foldUiEffects;
    const $avatarChatDisplay = $('div[name="AvatarAndChatDisplay"]');
    if ($avatarChatDisplay.length > 0) {
        let $effectsDrawer = $('#cut_m2_ui_effects_drawer');
        const $uiPresetsBlock = $('#UI-presets-block');

        if (shouldFoldUiEffects) {
            if ($effectsDrawer.length === 0) {
                const effectsDrawerHtml = `
                <div id="cut_m2_ui_effects_drawer" class="inline-drawer wide100p flexFlowColumn">
                    <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
                        <b>界面效果</b>
                        <div class="fa-solid fa-circle-chevron-down inline-drawer-icon down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                if ($uiPresetsBlock.length > 0) {
                    $uiPresetsBlock.after(effectsDrawerHtml);
                } else {
                    $avatarChatDisplay.before(effectsDrawerHtml);
                }
                $effectsDrawer = $('#cut_m2_ui_effects_drawer');
            }

            const $effectsDrawerContent = $effectsDrawer.find('>.inline-drawer-content');
            if ($effectsDrawerContent.find('div[name="AvatarAndChatDisplay"]').length === 0) {
                $effectsDrawerContent.append($avatarChatDisplay);
            }
            $effectsDrawer.show();
        } else {
            if ($effectsDrawer.length > 0) {
                if ($effectsDrawer.find('div[name="AvatarAndChatDisplay"]').length > 0) {
                    if ($uiPresetsBlock.length > 0) {
                        $uiPresetsBlock.after($avatarChatDisplay);
                    }
                }
                $effectsDrawer.hide();
            }
        }
    }

    // --- Feature 5: User Settings -> "主题开关" (FontBlurChatWidthBlock + themeToggles) ---
    const shouldFoldThemeToggles = isModule2Enabled && settings.module2.foldThemeToggles;
    const $fontBlurBlock = $('div[name="FontBlurChatWidthBlock"]');
    const $themeToggles = $('div[name="themeToggles"]');

    if ($fontBlurBlock.length > 0 || $themeToggles.length > 0) {
        let $togglesDrawer = $('#cut_m2_theme_toggles_drawer');
        const $col1 = $('div[name="UserSettingsFirstColumn"]');

        if (shouldFoldThemeToggles) {
            if ($togglesDrawer.length === 0) {
                const togglesDrawerHtml = `
                <div id="cut_m2_theme_toggles_drawer" class="inline-drawer wide100p flexFlowColumn">
                    <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
                        <b>主题开关</b>
                        <div class="fa-solid fa-circle-chevron-down inline-drawer-icon down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                if ($col1.length > 0) {
                    $col1.append(togglesDrawerHtml);
                }
                $togglesDrawer = $('#cut_m2_theme_toggles_drawer');
            }

            const $togglesDrawerContent = $togglesDrawer.find('>.inline-drawer-content');
            $col1.find('hr').hide();
            const $itemsToAppend = $fontBlurBlock.add($themeToggles);
            if ($itemsToAppend.length > 0) {
                $togglesDrawerContent.append($itemsToAppend);
            }
            $togglesDrawer.show();
        } else {
            if ($togglesDrawer.length > 0) {
                const $itemsToRestore = $togglesDrawer.find('div[name="FontBlurChatWidthBlock"], div[name="themeToggles"]');
                if ($itemsToRestore.length > 0 && $col1.length > 0) {
                    $col1.append($itemsToRestore);
                }
                $col1.find('hr').show();
                $togglesDrawer.hide();
            }
        }
    }

    // --- Feature 6: User Settings -> "高级设置" (Fold Column 2 AND Column 3 into Column 1 right after Theme Toggles) ---
    const shouldFoldUserAdvanced = isModule2Enabled && settings.module2.foldUserAdvanced;
    const $col1 = $('div[name="UserSettingsFirstColumn"]');
    const $col2 = $('div[name="UserSettingsSecondColumn"]');
    const $col3 = $('div[name="UserSettingsThirdColumn"]');

    if ($col2.length > 0 || $col3.length > 0) {
        let $advDrawer = $('#cut_m2_user_advanced_drawer');
        const $togglesDrawer = $('#cut_m2_theme_toggles_drawer');

        if (shouldFoldUserAdvanced) {
            if ($advDrawer.length === 0) {
                const advDrawerHtml = `
                <div id="cut_m2_user_advanced_drawer" class="inline-drawer wide100p flexFlowColumn">
                    <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
                        <b>高级设置</b>
                        <div class="fa-solid fa-circle-chevron-down inline-drawer-icon down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                if ($togglesDrawer.length > 0) {
                    $togglesDrawer.after(advDrawerHtml);
                } else if ($col1.length > 0) {
                    $col1.append(advDrawerHtml);
                } else if ($col2.length > 0) {
                    $col2.prepend(advDrawerHtml);
                }
                $advDrawer = $('#cut_m2_user_advanced_drawer');
            } else {
                if ($togglesDrawer.length > 0) {
                    $togglesDrawer.after($advDrawer);
                }
            }

            const $advDrawerContent = $advDrawer.find('>.inline-drawer-content');
            
            // Select all items except our drawers and #CustomCSS-block
            const $col2Children = $col2.children().not('#cut_m2_user_advanced_drawer, #CustomCSS-block, #cut_m2_custom_css_drawer');
            const $col3Children = $col3.children().not('#cut_m2_user_advanced_drawer, #CustomCSS-block, #cut_m2_custom_css_drawer');
            
            const $allAdvItems = $col2Children.add($col3Children);
            if ($allAdvItems.length > 0) {
                $advDrawerContent.append($allAdvItems);
            }

            if ($col3.length > 0) {
                $col3.hide();
            }

            $advDrawer.show();
        } else {
            if ($advDrawer.length > 0) {
                const $advItemsToRestore = $advDrawer.find('>.inline-drawer-content').children();
                if ($advItemsToRestore.length > 0) {
                    if ($col2.length > 0) {
                        $col2.append($advItemsToRestore);
                    }
                    if ($col3.length > 0) {
                        $col3.show();
                    }
                }
                $advDrawer.hide();
            }
        }
    }

    // --- Feature 7: User Settings -> "自定义样式" (#CustomCSS-block -> "自定义样式" right below "界面效果") ---
    const shouldFoldCustomCss = isModule2Enabled && settings.module2.foldCustomCss;
    const $customCssBlock = $('#CustomCSS-block');

    if ($customCssBlock.length > 0) {
        let $cssDrawer = $('#cut_m2_custom_css_drawer');
        const $effectsDrawer = $('#cut_m2_ui_effects_drawer');
        const $col2 = $('div[name="UserSettingsSecondColumn"]');

        if (shouldFoldCustomCss) {
            if ($cssDrawer.length === 0) {
                const cssDrawerHtml = `
                <div id="cut_m2_custom_css_drawer" class="inline-drawer wide100p flexFlowColumn">
                    <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
                        <b>自定义样式</b>
                        <div class="fa-solid fa-circle-chevron-down inline-drawer-icon down"></div>
                    </div>
                    <div class="inline-drawer-content" style="display: none;"></div>
                </div>
                `;
                if ($effectsDrawer.length > 0) {
                    $effectsDrawer.after(cssDrawerHtml);
                } else if ($col1.length > 0) {
                    $col1.prepend(cssDrawerHtml);
                } else if ($col2.length > 0) {
                    $col2.append(cssDrawerHtml);
                }
                $cssDrawer = $('#cut_m2_custom_css_drawer');
            } else {
                if ($effectsDrawer.length > 0) {
                    $effectsDrawer.after($cssDrawer);
                }
            }

            const $cssDrawerContent = $cssDrawer.find('>.inline-drawer-content');
            if ($cssDrawerContent.find('#CustomCSS-block').length === 0) {
                $cssDrawerContent.append($customCssBlock);
            }
            $cssDrawer.show();
        } else {
            if ($cssDrawer.length > 0) {
                if ($cssDrawer.find('#CustomCSS-block').length > 0 && $col2.length > 0) {
                    $col2.append($customCssBlock);
                }
                $cssDrawer.hide();
            }
        }
    }
}

/**
 * Applies CSS classes and DOM changes according to current settings
 */
function applySettings() {
    const settings = extension_settings[extensionName];
    const body = document.body;

    if (!settings || !settings.enabled) {
        body.classList.remove('cut-hide-tutorials', 'cut-hide-language-select', 'cut-hide-redirect-links', 'cut-hide-slider-tips', 'cut-hide-cc-invalid', 'cut-persona-450', 'cut-css-500');
        applyModule2Settings();
        return;
    }

    // Module 1 Features
    body.classList.toggle('cut-hide-tutorials', !!settings.module1.hideTutorials);
    body.classList.toggle('cut-hide-language-select', !!settings.module1.hideLanguageSelect);
    body.classList.toggle('cut-hide-redirect-links', !!settings.module1.hideRedirectLinks);
    body.classList.toggle('cut-hide-slider-tips', !!settings.module1.hideSliderTips);
    body.classList.toggle('cut-hide-cc-invalid', !!settings.module1.hideCcInvalid);

    // Module 2 Features
    body.classList.toggle('cut-persona-450', !!(settings.module2 && settings.module2.personaHeight450));
    body.classList.toggle('cut-css-500', !!(settings.module2 && settings.module2.customCssHeight500));
    applyModule2Settings();
}

/**
 * Renders the extension configuration panel inside the Extensions drawer with sub-tabs
 */
function renderSettingsUI() {
    const containerId = 'cut_container';
    let $container = $(`#${containerId}`);

    if ($container.length === 0) {
        const html = `
        <div id="${containerId}" class="inline-drawer extension_container">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>ui精简</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>

            <div class="inline-drawer-content" style="display: none;">
                <div class="cut-master-row">
                    <span>启用 UI 精简拓展</span>
                    <label class="checkbox_label margin0" title="开启/关闭精简拓展总开关">
                        <input type="checkbox" id="cut_master_toggle">
                    </label>
                </div>

                <div id="cut_modules_wrapper">
                    <!-- 模块切换 Tab 标签页 -->
                    <div class="cut-tabs">
                        <div class="cut-tab active" data-tab="cut_tab_m1">模块一</div>
                        <div class="cut-tab" data-tab="cut_tab_m2">模块二</div>
                    </div>

                    <!-- 模块一 Tab 内容 -->
                    <div id="cut_tab_m1" class="cut-tab-content active">
                        <div class="cut-module-section">
                            <div class="cut-module-title"><b>模块一：页面元素精简</b></div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m1_tutorials">
                                    <input type="checkbox" id="cut_m1_tutorials">
                                    <span>1. 隐藏问号图标引导及教程类</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">隐藏设置项旁、标题栏及页面各处的问号帮助与教程图标</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m1_language">
                                    <input type="checkbox" id="cut_m1_language">
                                    <span>2. 隐藏选择语言设置框</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">隐藏用户设置及初始引导页中的界面语言选择框 (Language Selector)</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m1_redirects">
                                    <input type="checkbox" id="cut_m1_redirects">
                                    <span>3. 隐藏三连跳转链接 (Docs / GitHub / Discord)</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">隐藏欢迎面板与顶部三连快捷图标（文档 Docs、GitHub、Discord 链接）</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m1_slidertips">
                                    <input type="checkbox" id="cut_m1_slidertips">
                                    <span>4. 隐藏滑块手动输入提示</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">隐藏“单击滑块以手动输入值”提示框 (#clickSlidersTips)</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m1_ccinvalid">
                                    <input type="checkbox" id="cut_m1_ccinvalid">
                                    <span>5. 隐藏高级格式化 Chat Completion 无效设置</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">隐藏高级格式化中聊天补全用不了的设置项 ([data-cc-null]) 与提示 (#advanced-formatting-cc-notice)</div>
                        </div>
                    </div>

                    <!-- 模块二 Tab 内容 -->
                    <div id="cut_tab_m2" class="cut-tab-content">
                        <div class="cut-module-section">
                            <div class="cut-module-title"><b>模块二：设置界面折叠与视界扩展</b></div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_presets">
                                    <input type="checkbox" id="cut_m2_fold_presets">
                                    <span>1. 折叠预设界面生成参数</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将预设面板中平铺的生成参数条目收纳进“预设参数”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_witop">
                                    <input type="checkbox" id="cut_m2_fold_witop">
                                    <span>2. 折叠世界书顶部区域 (#wiTopBlock)</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将世界书面板顶部的“已启用世界书”与“全局激活设置”收纳进“全局世界书”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_persona">
                                    <input type="checkbox" id="cut_m2_fold_persona">
                                    <span>3. 折叠用户设定高级参数</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将用户设定面板中的“插入位置”、“链接”及其小标题与“全局设置”收纳进“设定设置”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_ui_effects">
                                    <input type="checkbox" id="cut_m2_fold_ui_effects">
                                    <span>4. 折叠用户设置：界面效果</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将用户设置面板中的头像/聊天/媒体/通知选项收纳进“界面效果”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_custom_css">
                                    <input type="checkbox" id="cut_m2_fold_custom_css">
                                    <span>5. 折叠用户设置：自定义样式</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将自定义 CSS 框从高级设置中独立出来，收纳进“界面效果”正下方的“自定义样式”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_theme_toggles">
                                    <input type="checkbox" id="cut_m2_fold_theme_toggles">
                                    <span>6. 折叠用户设置：主题开关</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将用户设置面板中的窗口宽度/缩放/模糊/阴影滑块与全套 UI 复选开关收纳进“主题开关”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_fold_user_advanced">
                                    <input type="checkbox" id="cut_m2_fold_user_advanced">
                                    <span>7. 折叠用户设置：高级设置</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">将用户设置面板右侧的角色处理与聊天/消息处理功能收纳进“高级设置”四字折叠条</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_persona_450">
                                    <input type="checkbox" id="cut_m2_persona_450">
                                    <span>8. 用户设定概述输入框默认 450px</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">固定人设概述/描述输入框 (#persona_description) 默认高度为 450px，提供超大编辑视野</div>

                            <div class="cut-option-item">
                                <label class="cut-option-label" for="cut_m2_css_500">
                                    <input type="checkbox" id="cut_m2_css_500">
                                    <span>9. 自定义 CSS 编辑框默认高度 500px</span>
                                </label>
                            </div>
                            <div class="cut-option-desc">固定自定义 CSS 代码编辑框 (#customCSS) 默认高度为 500px，提供代码编辑视野</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Append to #extensions_settings drawer container if available
        if ($('#extensions_settings').length > 0) {
            $('#extensions_settings').append(html);
        } else {
            $('#rm_extensions_block .extensions_block').append(html);
        }

        $container = $(`#${containerId}`);
    }

    // Bind Tab switching logic
    $container.find('.cut-tab').off('click').on('click', function () {
        const tabId = $(this).attr('data-tab');
        $container.find('.cut-tab').removeClass('active');
        $(this).addClass('active');

        $container.find('.cut-tab-content').removeClass('active').hide();
        $container.find(`#${tabId}`).addClass('active').show();
    });

    // Bind values
    const settings = extension_settings[extensionName];
    $('#cut_master_toggle').prop('checked', settings.enabled);
    $('#cut_m1_tutorials').prop('checked', settings.module1.hideTutorials);
    $('#cut_m1_language').prop('checked', settings.module1.hideLanguageSelect);
    $('#cut_m1_redirects').prop('checked', settings.module1.hideRedirectLinks);
    $('#cut_m1_slidertips').prop('checked', settings.module1.hideSliderTips);
    $('#cut_m1_ccinvalid').prop('checked', settings.module1.hideCcInvalid);

    $('#cut_m2_fold_presets').prop('checked', settings.module2.foldPresets);
    $('#cut_m2_fold_witop').prop('checked', settings.module2.foldWorldInfoTop);
    $('#cut_m2_fold_persona').prop('checked', settings.module2.foldPersonaSettings);
    $('#cut_m2_fold_ui_effects').prop('checked', settings.module2.foldUiEffects);
    $('#cut_m2_fold_custom_css').prop('checked', settings.module2.foldCustomCss);
    $('#cut_m2_fold_theme_toggles').prop('checked', settings.module2.foldThemeToggles);
    $('#cut_m2_fold_user_advanced').prop('checked', settings.module2.foldUserAdvanced);
    $('#cut_m2_persona_450').prop('checked', settings.module2.personaHeight450);
    $('#cut_m2_css_500').prop('checked', settings.module2.customCssHeight500);

    // Event Handlers
    $('#cut_master_toggle').off('change').on('change', function () {
        settings.enabled = $(this).prop('checked');
        $('#cut_modules_wrapper').toggle(settings.enabled);
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m1_tutorials').off('change').on('change', function () {
        settings.module1.hideTutorials = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m1_language').off('change').on('change', function () {
        settings.module1.hideLanguageSelect = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m1_redirects').off('change').on('change', function () {
        settings.module1.hideRedirectLinks = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m1_slidertips').off('change').on('change', function () {
        settings.module1.hideSliderTips = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m1_ccinvalid').off('change').on('change', function () {
        settings.module1.hideCcInvalid = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_presets').off('change').on('change', function () {
        settings.module2.foldPresets = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_witop').off('change').on('change', function () {
        settings.module2.foldWorldInfoTop = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_persona').off('change').on('change', function () {
        settings.module2.foldPersonaSettings = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_ui_effects').off('change').on('change', function () {
        settings.module2.foldUiEffects = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_custom_css').off('change').on('change', function () {
        settings.module2.foldCustomCss = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_theme_toggles').off('change').on('change', function () {
        settings.module2.foldThemeToggles = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_fold_user_advanced').off('change').on('change', function () {
        settings.module2.foldUserAdvanced = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_persona_450').off('change').on('change', function () {
        settings.module2.personaHeight450 = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_m2_css_500').off('change').on('change', function () {
        settings.module2.customCssHeight500 = $(this).prop('checked');
        applySettings();
        saveSettingsDebounced();
    });

    $('#cut_modules_wrapper').toggle(settings.enabled);
}

// Initialize Extension
jQuery(async () => {
    loadSettings();
    applySettings();

    // Check & apply UI drawer rendering and module 2 DOM folding
    const checkDrawerInterval = setInterval(() => {
        if ($('#extensions_settings').length > 0 || $('#rm_extensions_block').length > 0) {
            renderSettingsUI();
        }
        if ($('#ai_response_configuration').length > 0 || $('#wi-holder').length > 0 || $('.persona_management_right_column').length > 0 || $('#user-settings-block-content').length > 0) {
            applyModule2Settings();
        }
        if ($('#cut_container').length > 0 && $('#cut_m2_gen_params_drawer').length > 0) {
            // keep polling lightly for dynamic DOM drawer updates
        }
    }, 500);

    console.log('[UI Trimmer] Extension "cut" (Module 1 & Module 2) initialized successfully.');
});
