from routes.ask import parse_question

def test_parse_fee_and_mode_and_level():
    q = 'Show PG courses under 50,000 INR offered online'
    f = parse_question(q)
    assert f['level'] == 'PG'
    assert f['delivery_mode'] == 'online'
    assert f['max_fee'] == 50000

def test_parse_department_alias():
    q = 'ug cs courses below 40000'
    f = parse_question(q)
    assert f['level'] == 'UG'
    assert f['department'] == 'computer science'
    assert f['max_fee'] == 40000

def test_parse_rating():
    q = 'courses with rating 4.5 or higher'
    f = parse_question(q)
    assert f['min_rating'] == 4.5

def test_parse_offline_mode():
    q = 'offline mechanical courses'
    f = parse_question(q)
    assert f['delivery_mode'] == 'offline'
    assert f['department'] == 'mechanical'