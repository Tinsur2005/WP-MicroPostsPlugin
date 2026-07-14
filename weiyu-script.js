/**
 * WP微语插件 - 前端动态加载脚本
 * 
 * 功能：实现微语列表的AJAX动态分页，无需刷新页面
 */

(function($) {
    'use strict';
    
    var WeiyuList = {
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        
        init: function() {
            this.cacheElements();
            this.bindEvents();
            
            var totalPagesEl = $('.weiyu-total-pages');
            if (totalPagesEl.length > 0) {
                this.totalPages = parseInt(totalPagesEl.data('total-pages'), 10);
            }
        },
        
        cacheElements: function() {
            this.$list = $('.weiyu-list');
            this.$pagination = $('.weiyu-pagination');
            this.$loading = $('.weiyu-loading');
        },
        
        bindEvents: function() {
            var self = this;
            
            $(document).on('click', '.weiyu-pagination a', function(e) {
                e.preventDefault();
                
                var href = $(this).attr('href');
                var page = self.getPageFromUrl(href);
                
                if (page && page !== self.currentPage && !self.isLoading) {
                    self.loadPage(page);
                }
            });
        },
        
        getPageFromUrl: function(url) {
            var match = url.match(/paged=(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        },
        
        loadPage: function(page) {
            var self = this;
            
            self.isLoading = true;
            self.currentPage = page;
            
            self.showLoading();
            
            self.$list.fadeOut(300, function() {
                $.ajax({
                    url: weiyu_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'weiyu_load_page',
                        page: page,
                        security: weiyu_ajax.nonce
                    },
                    success: function(response) {
                        if (response.success) {
                            self.renderList(response.data.list);
                            self.renderPagination(response.data.pagination_html, response.data.current_page);
                            self.updateStats(response.data.total);
                            
                            self.$list.fadeIn(400);
                        } else {
                            console.error('加载微语失败:', response.data);
                            self.$list.fadeIn(300);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('AJAX请求失败:', error);
                        self.$list.fadeIn(300);
                    },
                    complete: function() {
                        self.isLoading = false;
                        self.hideLoading();
                        
                        $('html, body').animate({
                            scrollTop: $('.weiyu-container').offset().top - 60
                        }, 600, 'swing');
                    }
                });
            });
        },
        
        renderList: function(list) {
            var html = '';
            var nickname = weiyu_ajax.nickname;
            
            $.each(list, function(index, weiyu) {
                html += '<article class="weiyu-card weiyu-card-animate" style="animation-delay: ' + (index * 100) + 'ms;">';
                html += '<div class="weiyu-author">';
                html += '<div class="weiyu-meta">';
                html += '<span class="weiyu-nickname">' + nickname + '</span>';
                html += '<span class="weiyu-time">' + weiyu.created_at + '</span>';
                html += '</div>';
                html += '</div>';
                html += '<div class="weiyu-content">' + weiyu.content + '</div>';
                html += '</article>';
            });
            
            this.$list.html(html);
        },
        
        renderPagination: function(html, currentPage) {
            this.$pagination.html(html);
            
            this.$pagination.find('a').on('click', function(e) {
                e.preventDefault();
            });
        },
        
        updateStats: function(total) {
            var $stats = $('.weiyu-stats');
            if ($stats.length > 0) {
                var viewCount = $stats.data('view-count') || 0;
                $stats.html('共 ' + viewCount + ' 人浏览 | 共 ' + total + ' 条微语');
            }
        },
        
        showLoading: function() {
            if (this.$loading.length === 0) {
                this.$loading = $('<div class="weiyu-loading"><div class="weiyu-spinner"></div><span>加载中...</span></div>');
                this.$list.before(this.$loading);
            }
            this.$loading.fadeIn(200);
        },
        
        hideLoading: function() {
            if (this.$loading) {
                this.$loading.fadeOut(200);
            }
        }
    };
    
    $(document).ready(function() {
        WeiyuList.init();
    });
    
})(jQuery);