const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST /api/v1/alerts — create job alert
exports.createAlert = async (req, res) => {
  try {
    const { user_id, user_email, keyword, city, work_type } = req.body;
    if (!user_id || !keyword) return res.status(400).json({ error: 'user_id and keyword required' });

    const { data, error } = await supabase
      .from('job_alerts')
      .insert([{ user_id, user_email, keyword, city, work_type }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('createAlert error:', err);
    res.status(500).json({ error: 'Error creating alert' });
  }
};

// GET /api/v1/alerts?user_id=
exports.getUserAlerts = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const { data, error } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('getUserAlerts error:', err);
    res.status(500).json({ error: 'Error fetching alerts' });
  }
};

// DELETE /api/v1/alerts/:id
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('job_alerts').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Alert deleted' });
  } catch (err) {
    console.error('deleteAlert error:', err);
    res.status(500).json({ error: 'Error deleting alert' });
  }
};
