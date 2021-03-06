(function() {
	var $fixture;
	
	QUnit.testStart(function() {
		$fixture = $('#qunit-fixture');
	});
	QUnit.testDone(function() {
		$('#container').remove();
	});

	module('Observe this');

	test('Attribute changed', function() {
		stop();
		expect(4);

		var $ul = $fixture.find('ul');

		$ul.observe('attributes', function(record) {
			equal(this, record.target, 'Attribute changed on this');
			equal(this, $ul[0]);
			equal('attributes', record.type);
			equal('data-attr', record.attributeName);

			start();
		});

		helper($ul).attr('data-attr', 'value');
	});
	test('Double match (all, restrictive) on attribute changed', function() {
		stop(2);
		expect(6);

		var $ul = $fixture.find('ul');
		var fn = function(record) {
			equal(this, $ul[0], 'Changed attribute on this');
			equal('attributes', record.type);
			equal('data-attr', record.attributeName);

			start();
		};

		$ul
			.observe('attributes', fn)
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, fn);

		helper($ul).attr('data-attr', 'value');
	});
	test('Double match (restrictive, all) on attribute changed', function() {
		stop(2);
		expect(6);

		var $ul = $fixture.find('ul');
		var fn = function(record) {
			equal(this, $ul[0], 'Changed attribute on this');
			equal('attributes', record.type);
			equal('data-attr', record.attributeName);

			start();
		};

		$ul
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, fn)
			.observe('attributes', fn);

		helper($ul).attr('data-attr', 'value');
	});
	test('Single match (all, restrictive) on attribute changed', function() {
		stop();
		expect(3);

		var $ul = $fixture.find('ul');
		var fn = function(record) {
			equal(this, $ul[0], 'Changed attribute on this');
			equal('attributes', record.type);
			equal('data-other', record.attributeName);

			start();
		};

		$ul
			.observe('attributes', fn)
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, fn);

		helper($ul).attr('data-other', 'value');
	});
	test('Single match (restrictive, all) on attribute changed', function() {
		stop();
		expect(3);

		var $ul = $fixture.find('ul');
		var fn = function(record) {
			equal(this, $ul[0], 'Changed attribute on this');
			equal('attributes', record.type);
			equal('data-other', record.attributeName);

			start();
		};

		$ul
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, fn)
			.observe('attributes', fn);

		helper($ul).attr('data-other', 'value');
	});
	test('Node added', function() {
		stop();
		expect(2);

		var $ul = $fixture.find('ul');

		$ul.observe('childlist', function(record) {
			equal(this, record.target, 'Added node to this');
			equal('childList', record.type);

			start();
		});

		helper($ul).add('<li>Item 0</li>');
	});
	test('Node removed', function() {
		stop();
		expect(2);

		var $ul = $fixture.find('ul');

		$ul.observe('childlist', function(record) {
			equal(this, record.target, 'Removed node from this');
			equal('childList', record.type);

			start();
		});

		helper($ul.find('li:first')).remove();
	});
	test('Content swapped', function() {
		stop(2);
		expect(4);

		var $header = $('#header');

		$header.observe('childlist subtree', function(record) {
			equal(this, $header[0], 'Child text nodes swapped');
			equal('childList', record.type);

			start();
		});

		helper($header).content('value');
	});
	test('Character data changed', function() {
		stop();
		expect(2);

		var $header = $('#header');

		// Added subtree opition because of Chrome bug.
		$header.observe('characterData subtree', function(record) {
			equal(this, $header[0], 'Child text node value changed');
			equal('characterData', record.type);

			start();
		});

		helper($header).text('value');
	});
	test('Subtree option', function() {
		stop();
		expect(2);

		var $ul = $fixture.find('ul');

		$ul.observe('childlist subtree', function(record) {
			equal(this, $ul[0], 'Subtree modified without selector');
			equal('childList', record.type);

			start();
		});

		helper($ul.find('span')).remove();
	});

	module('Observe child');

	test('Child attibute changed', function() {
		stop();
		expect(3);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:first');

		$ul.observe('attributes', 'li:first', function(record) {
			equal(this, $li[0], 'Changed child attribute');
			equal('attributes', record.type);
			equal('data-attr', record.attributeName);

			start();
		});

		helper($li).attr('data-attr', 'value');
	});
	test('Child node added', function() {
		stop();
		expect(3);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:first');

		$ul.observe('childlist', 'li:first span', function(record) {
			equal(this, $li.find('span')[0], 'Added child node');
			equal('childList', record.type);
			equal(1, record.addedNodes.length);

			start();
		});

		helper($li).add('<span>value</span>');
	});
	test('Child node removed', function() {
		stop();
		expect(3);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:last');

		$ul.observe('childlist', 'li:last span', function(record) {
			equal(this, $li[0], 'Removed child node');
			equal('childList', record.type);
			equal(1, record.removedNodes.length);

			start();
		});

		helper($li.find('span')).remove();
	});
	test('Removed child node with no siblings', function() {
		stop();
		expect(2);

		var $span = $('#menu');

		$span.observe('childlist', 'a', function(record) {
			equal(this, $span[0], 'Child removed');
			equal('childList', record.type);

			start();
		});

		helper($span.find('a')).remove();
	});
	test('Swapped content of child node', function() {
		stop(2);
		expect(6);

		var $ul = $fixture.find('ul');
		var removing = true;

		$ul.observe('childlist', 'li', function(record) {
			if(removing) {
				removing = false;

				equal(1, record.removedNodes.length, 'Removed text node');
			} else {
				equal(1, record.addedNodes.length, 'Added text node');
			}

			equal(this, $ul.find('li:first')[0]);
			equal('childList', record.type);

			start();
		});

		helper($ul.find('li:first')).content('value');
	});
	test('Character data changed on child element', function() {
		stop();
		expect(2);

		var $ul = $fixture.find('ul');

		$ul.observe('characterData', 'li', function(record) {
			equal(this, $ul.find('li:first')[0], 'Child text node content modified');
			equal('characterData', record.type);

			start();
		});

		helper($ul.find('li:first')).text('value');
	});
	test('Multiple element match on node added', function() {
		stop(2);
		expect(4);

		var $ul = $fixture.find('ul');
		var i = 0;

		$ul.observe('childlist', 'li em', function(record) {
			equal(this, $ul.find('li em')[i++], 'Multiple item matches');
			equal('childList', record.type);

			start();
		});

		helper($ul.find('li:first')).add('<em>value</em>', function() {
			setTimeout(function() {
				$ul.find('li:last').append('<em>value</em>');
			}, 100);
		});
	});
	test('Multiple element match on multiple insert', function() {
		stop(2);
		expect(4);

		var $ul = $fixture.find('ul');
		var i = 0;

		$ul.observe('childlist', 'li em', function(record) {
			equal(this, $ul.find('li em')[i++], 'Multiple item matches');
			equal('childList', record.type);

			start();
		});

		helper($ul.find('li:first')).add('<em></em><em></em>');
	});

	module('Multiple observers');

	test('Child node added and attribute changed', function() {
		stop(2);
		expect(4);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:first');

		$ul
			.observe('childlist', 'li:first span', function(record) {
				equal(this, $li.find('span')[0], 'Added child node');
				equal('childList', record.type);

				start();
			})
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, 'li:first', function(record) {
				equal(this, $li[0], 'Changed attribute');
				equal('attributes', record.type);

				start();
			});

		helper($li).add('<span>value</span>');
		helper($li).attr('data-attr', 'value');
	});
	test('Child node added and removed', function() {
		stop(2);
		expect(2);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:first');

		$ul.observe('childlist', 'li:first span', function(record) {
			equal('childList', record.type);

			start();
		});

		helper($li).add('<span>value</span>', function() {
			// If the node is removed too fast the DOM is updated, 
			// before a record can be processed.
			setTimeout(function() {
				$li.find('span').remove();
			}, 100);
		});
	});
	test('Nodes added and attribute changed', function() {
		stop(3);
		expect(9);

		var $ul = $fixture.find('ul');

		$ul
			.observe('attributes', function(record) {
				equal(this, $ul[0], 'Changed attribute on this');
				equal('attributes', record.type);
				equal('data-other', record.attributeName);

				start();
			})
			.observe('childlist', 'li:first span', function(record) {
				equal(this, $ul.find('li:first span')[0], 'Added node to first li');
				equal('childList', record.type);
				equal(1, record.addedNodes.length);

				start();
			})
			.observe({ attributes: true, attributeFilter: ['data-attr'] }, 'li:last', function(record) {
				equal(this, $ul.find('li:last')[0], 'Changed attibute on last li');
				equal('attributes', record.type);
				equal('data-attr', record.attributeName);

				start();
			});

		helper($ul).attr('data-other', 'value');
		helper($ul.find('li:first')).add('<span>value</span>');
		helper($ul.find('li:last')).attr('data-attr', 'value');
	});
	test('Multiple matches on add node', function() {
		stop(2);
		expect(4);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:first');

		$ul
			.observe('childlist', 'li:first span', function(record) {
				equal(this, $li.find('span')[0], 'Span inserted');
				equal('childList', record.type);

				start();
			})
			.observe('childlist', 'li:first span a', function(record) {
				equal(this, $li.find('span a')[0], 'Span with a inserted');
				equal('childList', record.type);

				start();
			});

		helper($li).add('<span><a href="#">value</a></span>');
	});
	test('Multiple matches on remove node', function() {
		stop(2);
		expect(4);

		var $ul = $fixture.find('ul');
		var $li = $ul.find('li:last');

		$ul
			.observe('childlist', 'li', function(record) {
				equal(this, $ul[0], 'Li removed');
				equal('childList', record.type);

				start();
			})
			.observe('childlist', 'li span', function(record) {
				equal(this, $ul[0], 'Li with span remved');
				equal('childList', record.type);

				start();
			});

		helper($li).remove();
	});
	test('Match on deep insert', function() {
		stop();
		expect(2);

		var $ul = $fixture.find('ul');

		$ul.observe('childlist', 'li span div em', function(record) {
			equal(this, $ul.find('li:last span div em')[0], 'Added em element');
			equal('childList', record.type);

			start();
		});

		helper($ul.find('li:last span')).add('<div><em></em></div>');
	});
	test('Match on deep removale', function() {
		stop();
		expect(2);

		var $container = $('#container');

		$container.observe('childlist', 'div ul li .last-li', function(record) {
			equal(this, $('#content')[0], 'Removed ul element');
			equal('childList', record.type);

			start();
		});

		helper($container.find('ul')).remove();
	});
}());
