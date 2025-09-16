from app import create_app

def test_health():
    app = create_app()
    client = app.test_client()
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.get_json()['status'] == 'ok'

def test_courses_endpoint():
    app = create_app()
    client = app.test_client()
    r = client.get('/api/courses')
    assert r.status_code == 200
    data = r.get_json()
    assert 'items' in data
    assert 'total' in data
    assert 'page' in data
    assert 'page_size' in data

def test_compare_endpoint():
    app = create_app()
    client = app.test_client()
    r = client.get('/api/compare?ids=CS101,CS201')
    assert r.status_code == 200
    data = r.get_json()
    assert 'items' in data