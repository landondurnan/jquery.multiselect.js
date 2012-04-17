(function($){
  "use strict";
  $.fn.multiselect = function(options){
    var settings = {
      'selectedHeader' : 'Selected Items',
      'noItemsLabel' : 'None Selected',
      'selectAll' : 'Select All',
      'clearAll' : 'Clear All'
    };

    return this.each(function() {
      
      if (options) {
        $.extend(settings, options);
      }
      
      var $multi = $(this);
      var select = $multi.children().toArray(); // Get options in multiselect
      var choices = $('<div />', { "class": "multi-choices"});
      var selected = $('<div />', { "class": "multi-selected"});
      var quickSelect = '<li class="toggle toggle-on" style="display: none;"><span />' + settings.selectAll + '</li>';
      var quickClear = '<li class="toggle toggle-off" style="display: none;"><span />' + settings.clearAll + '</li>';
      var group = ''; 
      var items = ''; 
      var numChildren = 0;
      
      $multi.hide();
      
      if(!$multi.children('optgroup').length) {
        $multi.children('option').wrapAll('<optgroup label="Options"></optgroup>');
      }
      
      // Build output
      $(select).each(function(i){
        if($(this).attr("label")){
          numChildren = $(this).children('option').length;
          group += '<li class="col1-item" data-group="group-'+ i +'"><span>' + numChildren + '</span>' + $(this).attr("label") + '</li>';           
          $(this).children('option').each(function(){
            if($(this).attr("selected")){ 
              items += '<li data-group="group-' + i + '" class="active" data-value="' + $(this).val() + '"><span />' + $(this).text() + '</li>';
            } else { 
              items += '<li data-group="group-' + i + '" data-value="' + $(this).val() + '"><span />' + $(this).text() + '</li>'; 
            }
          });
        }
      });   
      
      // Alphabetize items
      var alpha = $('<ul />').append(items);
      var itemsort = alpha.children('li').get();
      itemsort.sort(function(a, b) {
         var compA = $(a).text();
         var compB = $(b).text();
         return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
      });
      $.each(itemsort, function(idx, itm) { alpha.append(itm); });
      items = alpha;
      
      // Output finder columns
      $(choices).append('<ul class="multi-optgroup" /><ul class="multi-items" />');
      $(choices).find('ul.multi-optgroup').append(group);
      $(choices).find('ul.multi-items').append(quickSelect).append(quickClear).append(items.html());
      $multi.after(choices);

      // Output selected menu
      $(selected).append('<label>' + settings.selectedHeader + '</label><ul />');
      $(selected).find('ul').append(quickClear).append('<li class="no-data">' + settings.noItemsLabel + '</li>' + items.html());
      $multi.after(selected);
      
      setSelectedOutput();

      // Set Active Optgroup
      $(choices).find('.col1-item').click(function(){
        $(this).addClass('selected').siblings().removeClass('selected');
        
        // Display related items
        $(choices)
          .find('.multi-items li')
          .hide()
        .end()
          .find('.multi-items li[data-group=' + $(this).attr('data-group') + ']')
          .fadeIn(); 
        
        // Update Quick Toggle
        quickChoice($(this).attr('data-group'));
      });

      // Set default output for selected items
      function setSelectedOutput(){
        if(!$multi.val()){ 
          $(selected)
            .find('li.no-data')
            .show()
          .end() 
            .find('li.toggle')
            .hide();
        } else { 
          $(selected)
            .find('li.no-data')
            .hide()
          .end()
            .find('li.toggle')
            .show(); 
        }
	// Trigger the change event on the form element itself, for the benefit of DOM listeners
	$multi.trigger('change', [$multi.val()]);
      }

      // Update viewable selected items
      function updateSelected(item, toggle){
        setSelectedOutput(); 
        if(toggle){ 
          $(selected).find('li[data-value=' + $(item).attr('data-value') + ']').show(); 
        } else {  
          $(selected).find('li[data-value=' + $(item).attr('data-value') + ']').hide(); 
        }
        quickChoice($(item).attr('data-group'));
      }
      
      function selectItem(item){
        $(item).addClass('active');
        $multi.find('option[value='+ $(item).attr('data-value') + ']').attr('selected', true);
        updateSelected($(item), true);
      }
      
      function deselectItem(item){
        $(item).removeClass('active');
        $multi.find('option[value='+ $(item).attr('data-value') + ']').removeAttr('selected');
        updateSelected($(item), false);
      }
      
      // Handle all actions related to the quick choices in each menu
      function quickChoice(group){
        // Check items selected in group, 
        var grp = $(choices).find('.multi-items li[data-group=' + group + ']');
        if($(grp).filter('li.active').length){
          // all selected provide clear button
          $(choices).find('.toggle-on').hide();
          $(choices).find('.toggle-off').fadeIn();
        } else {
          // provide select button
          $(choices).find('.toggle-off').hide();
          $(choices).find('.toggle-on').fadeIn();
        }
      }
      
      // Handle clearing all items from a group
      function clearAll(group){
        var gid = $(group).nextAll(':visible').attr('data-group');        // Get group id
        $(choices).find('ul.multi-items li[data-group=' + gid + ']').each(function(){
          deselectItem($(this));
        });
      }
      
      // Select all items in this group
      $(choices).find('.toggle-on').click(function(){
        var gid = $(this).nextAll(':visible').attr('data-group');        // Get group id
        $(choices).find('ul.multi-items li[data-group=' + gid + ']').each(function(){
          selectItem($(this));
        });
      });
      
      // Clear all items in this group
      $(choices).find('.toggle-off').click(function(){
        clearAll($(this));
      });
      
      // Clear all items in this group
      $(selected).find('.toggle-off').click(function(){
        clearAll($(this));
      });

      // Toggle active options 
      $(choices + '.multi-items li').live('click', function(){ 
        selectItem($(this));
      });
      $(choices + '.multi-items li.active').live('click', function(){ 
        deselectItem($(this));
      });

      // Handle removing items from the selected list
      $(selected).find('li:not(.no-data,.toggle)').click(function(){
        $multi.find('option[value='+ $(this).attr('data-value') + ']').removeAttr('selected');
        $(choices).find('.multi-items li[data-value=' + $(this).attr('data-value') + ']').removeClass("active");
        $(this).hide();  
        setSelectedOutput();
      });
      
    });
  };
})(jQuery);