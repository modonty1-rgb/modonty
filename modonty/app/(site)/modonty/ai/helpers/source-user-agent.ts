/**
 * Who is asking, sent to every source of this page. GitHub refuses requests without one
 * («Requests with no User-Agent header will be rejected», REST API docs), and a named agent with a
 * contact is what arXiv and Hugging Face ask of automated clients.
 */
export const SOURCE_USER_AGENT = "modonty.com AI page (modonty1@gmail.com)";
